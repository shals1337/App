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

from collections import Counter, defaultdict

from oddscalc import api
from oddscalc.odds import decimal_to_implied, fair_odds, remove_vig
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


def _totals(ev: dict):
    """Beregn over/under-konsensus for den mest udbredte mållinje.

    Returnerer ``{"point": 2.5, "over": {...}, "under": {...}}`` eller None.
    Hver bookmaker kan tilbyde forskellige linjer (2.5, 3.0); vi vælger den
    linje flest bookmakere har, og laver konsensus + bedste odds på den.
    """
    # linje -> {bookmaker: {"Over": pris, "Under": pris}}
    by_line = defaultdict(dict)
    for book in ev.get("bookmakers", []):
        for market in book.get("markets", []):
            if market.get("key") != "totals":
                continue
            prices = {}
            point = None
            for o in market.get("outcomes", []):
                prices[o["name"]] = float(o["price"])
                point = o.get("point")
            if point is not None and "Over" in prices and "Under" in prices:
                by_line[point][book["title"]] = prices

    if not by_line:
        return None
    # Vælg linjen med flest bookmakere.
    point = max(by_line, key=lambda p: len(by_line[p]))
    books = by_line[point]

    fair_over = []
    for prices in books.values():
        fo, _ = remove_vig([prices["Over"], prices["Under"]])
        fair_over.append(fo)
    prob_over = sum(fair_over) / len(fair_over)
    prob_under = 1 - prob_over

    def side(name, prob):
        best_all = max((p[name] for p in books.values()), default=0.0)
        book_all = next((b for b, p in books.items() if p[name] == best_all), "")
        ne = {b: p for b, p in books.items() if b not in EXCHANGES}
        best_ne = max((p[name] for p in ne.values()), default=0.0)
        book_ne = next((b for b, p in ne.items() if p[name] == best_ne), "")
        return {
            "name": name,
            "prob": round(prob, 4),
            "fair": round(fair_odds(prob), 2),
            "bestAll": round(best_all, 2),
            "bookAll": book_all,
            "bestNE": round(best_ne, 2),
            "bookNE": book_ne,
        }

    return {
        "point": point,
        "books": len(books),
        "outcomes": [side("Over", prob_over), side("Under", prob_under)],
    }


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
        match = {
            "home": a.home_team,
            "away": a.away_team,
            "league": a.league or "",
            "sportKey": ev.get("sport_key", ""),
            "commence": a.commence_time or "",
            "books": a.num_bookmakers,
            "margin": round((a.avg_overround - 1) * 100, 1),
            "outcomes": outcomes,
        }
        tot = _totals(ev)
        if tot:
            match["totals"] = tot
        out.append(match)
    out.sort(key=lambda m: m["commence"])
    return out


def main(argv: list) -> int:
    if len(argv) < 1:
        print("brug: python web/build.py <raw.json> [out.html]", file=sys.stderr)
        return 2
    raw = json.load(open(argv[0], encoding="utf-8"))
    matches = build_matches(raw)

    from datetime import datetime, timezone

    built_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # --- historik: gem et snapshot pr. kamp, så odds-grafer bygges over tid ---
    hist_path = Path(__file__).parent / "history.json"
    history = {}
    if hist_path.exists():
        try:
            history = json.loads(hist_path.read_text(encoding="utf-8"))
        except ValueError:
            history = {}
    for m in matches:
        mid = f"{m['home']}|{m['away']}|{m['commence']}"
        snaps = history.get(mid, [])
        snaps.append(
            {
                "t": built_at,
                "h2h": [o["bestAll"] for o in m["outcomes"]],
            }
        )
        history[mid] = snaps[-60:]  # behold seneste 60 målinger
    # Ryd kampe der er mere end 2 dage overstået for at holde filen lille.
    hist_path.write_text(
        json.dumps(history, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    # Læg kun historik for de aktuelle kampe ind i siden.
    embed_hist = {
        f"{m['home']}|{m['away']}|{m['commence']}": history.get(
            f"{m['home']}|{m['away']}|{m['commence']}", []
        )
        for m in matches
    }

    template = (Path(__file__).parent / "template.html").read_text(encoding="utf-8")
    data_json = json.dumps(matches, ensure_ascii=False, separators=(",", ":"))
    hist_json = json.dumps(embed_hist, ensure_ascii=False, separators=(",", ":"))
    html = (
        template.replace("/*__DATA__*/[]", data_json)
        .replace("/*__HIST__*/{}", hist_json)
        .replace("__BUILT_AT__", built_at)
    )

    out_path = argv[1] if len(argv) > 1 else str(Path(__file__).parent / "index.html")
    Path(out_path).write_text(html, encoding="utf-8")

    leagues = sorted({m["league"] for m in matches})
    print(f"Skrev {out_path}: {len(matches)} kampe, {len(leagues)} ligaer.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
