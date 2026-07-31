"""Hent odds fra OddsPapi for flere sportsgrene og skriv én rå JSON-fil.

Resultatet fodres direkte til ``build.py``, som bygger web-appen.

Kvote: hver kørsel koster ca.
``sportsgrene x (1 kampliste + 1 markedskatalog) + bookmakere x ceil(turneringer/5)``
forespørgsler. Hold ``--tournaments`` lavt på gratis-planen (250 i alt).

Brug::

    ODDSPAPI_KEY=xxx python web/fetch_op.py --out all_sports.json \
        --sports 10,11,12 --tournaments 5 --days 7
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from oddscalc import oddspapi as op


def main(argv: list) -> int:
    ap = argparse.ArgumentParser(description="Hent odds fra OddsPapi")
    ap.add_argument("--out", default="all_sports.json", help="output-fil")
    ap.add_argument(
        "--sports",
        default="10",
        help="komma-separerede sportId'er (10=fodbold, 11=basketball, 12=tennis)",
    )
    ap.add_argument(
        "--tournaments",
        type=int,
        default=5,
        help="max turneringer pr. sportsgren (5 turneringer = 1 kald pr. bookmaker)",
    )
    ap.add_argument("--days", type=int, default=7, help="dage frem")
    ap.add_argument(
        "--books",
        default="",
        help="komma-separerede bookmaker-slugs (standard: danske + skarpe)",
    )
    args = ap.parse_args(argv)

    books = [b.strip() for b in args.books.split(",") if b.strip()] or None
    sports = [int(s) for s in args.sports.split(",") if s.strip()]

    try:
        acct = op.account()
        print(f"konto: {acct['plan']} · {acct['left']} forespørgsler tilbage")
    except op.OddsPapiError as e:
        print("kunne ikke læse konto:", e, file=sys.stderr)
        acct = None

    events = []
    for sid in sports:
        name = op.SPORTS.get(sid, f"sport {sid}")
        print(f"\n=== {name} (sportId {sid}) ===")
        try:
            evs = op.collect(
                sport_id=sid,
                bookmakers=books,
                days=args.days,
                max_tournaments=args.tournaments,
            )
        except op.OddsPapiError as e:
            print(f"  ! springer over: {e}", file=sys.stderr)
            continue
        print(f"  -> {len(evs)} kampe")
        events += evs

    Path(args.out).write_text(
        json.dumps(events, ensure_ascii=False), encoding="utf-8"
    )
    print(f"\nSkrev {len(events)} kampe til {args.out}")
    try:
        after = op.account()
        print(f"forespørgsler tilbage: {after['left']}")
    except op.OddsPapiError:
        pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
