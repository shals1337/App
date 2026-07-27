"""Byg den selvstændige web-app ud fra rå The Odds API-data.

Læser en rå JSON-fil (liste af kampe fra The Odds API, evt. flere ligaer
sammensat), regner konsensus-sandsynligheder + value, og skriver en færdig
``index.html`` med al data indlejret — så siden virker uden server.

Brug::

    python web/build.py all_soccer.json            # -> web/index.html
    python web/build.py all_soccer.json out.html
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from oddscalc import api
from oddscalc.probs import EXCHANGES, analyse_match


def _best_odds(prices_by_book: dict, name: str, exclude: set):
    """Bedste (højeste) odds for et udfald, evt. med bookmakere ekskluderet."""
    best_odds, best_book = 0.0, ""
    for book, prices in prices_by_book.items():
        if book in exclude:
            continue
        if name in prices and prices[name] > best_odds:
            best_odds, best_book = prices[name], book
    return best_odds, best_book


def build_matches(raw: list) -> list:
    """Kør analyse på alle kampe og returnér serialiserbare dicts.

    For hvert udfald gemmes bedste odds *både* med og uden børser, så
    web-appens børs-toggle kan skifte live uden at genberegne på serveren.
    """
    out = []
    for ev in raw:
        norm = api.normalise_event(ev)
        books = norm["bookmaker_odds"]
        if not books:
            continue
        try:
            a = analyse_match(
                home_team=norm["home_team"],
                away_team=norm["away_team"],
                outcome_names=norm["outcome_names"],
                bookmaker_odds=books,
                commence_time=norm["commence_time"],
                league=norm["league"],
            )
        except ValueError:
            continue

        outcomes = []
        for o in a.outcomes:
            all_odds, all_book = _best_odds(books, o.name, set())
            ne_odds, ne_book = _best_odds(books, o.name, EXCHANGES)
            outcomes.append(
                {
                    "name": o.name,
                    "prob": round(o.consensus_prob, 4),
                    "fair": round(o.fair_decimal_odds, 2),
                    # bedste med alle bookmakere:
                    "bestAll": round(all_odds, 2),
                    "bookAll": all_book,
                    # bedste uden børser:
                    "bestNE": round(ne_odds, 2),
                    "bookNE": ne_book,
                }
            )
        out.append(
            {
                "home": a.home_team,
                "away": a.away_team,
                "league": a.league or "",
                "sportKey": ev.get("sport_key", ""),
                "commence": a.commence_time or "",
                "books": a.num_bookmakers,
                "margin": round((a.avg_overround - 1) * 100, 1),
                "outcomes": outcomes,
            }
        )
    out.sort(key=lambda m: m["commence"])
    return out


def main(argv: list) -> int:
    if len(argv) < 1:
        print("brug: python web/build.py <raw.json> [out.html]", file=sys.stderr)
        return 2
    raw = json.load(open(argv[0], encoding="utf-8"))
    matches = build_matches(raw)

    template = (Path(__file__).parent / "template.html").read_text(encoding="utf-8")
    data_json = json.dumps(matches, ensure_ascii=False, separators=(",", ":"))
    from datetime import datetime, timezone

    built_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    html = template.replace("/*__DATA__*/[]", data_json).replace(
        "__BUILT_AT__", built_at
    )

    out_path = argv[1] if len(argv) > 1 else str(Path(__file__).parent / "index.html")
    Path(out_path).write_text(html, encoding="utf-8")

    leagues = sorted({m["league"] for m in matches})
    print(f"Skrev {out_path}: {len(matches)} kampe, {len(leagues)} ligaer.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
