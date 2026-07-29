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
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from collections import Counter, defaultdict


# Almindelige klub-"støjord" der fjernes ved navne-matchning på tværs af
# datakilder (The Odds API vs football-data.org bruger fx "Manchester City"
# vs "Manchester City FC").
_CLUB_STOPWORDS = {
    "fc", "afc", "cf", "sc", "ac", "if", "bk", "fk", "sk", "ssc", "ss",
    "us", "ud", "cd", "rc", "sv", "vfl", "vfb", "tsg", "sd", "cp", "de",
    "the", "club", "calcio", "aef", "aek",
}
# Kendte alias'er hvor normalisering ikke er nok (kortnavne osv.).
_TEAM_ALIASES = {
    "wolves": "wolverhampton wanderers",
    "spurs": "tottenham hotspur",
    "man city": "manchester city",
    "man utd": "manchester united",
    "man united": "manchester united",
    "brighton": "brighton hove albion",
    "nottm forest": "nottingham forest",
    "inter": "internazionale",
    "inter milan": "internazionale",
    "psg": "paris saint germain",
    "atletico madrid": "atletico de madrid",
    "betis": "real betis",
}


def normalize_team(name: str) -> str:
    """Reducér et holdnavn til en robust match-nøgle på tværs af datakilder."""
    if not name:
        return ""
    s = unicodedata.normalize("NFKD", str(name))
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[.\-'&/]", " ", s)
    s = re.sub(r"[^a-z0-9 ]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = _TEAM_ALIASES.get(s, s)
    toks = [t for t in s.split(" ") if t and t not in _CLUB_STOPWORDS]
    return " ".join(toks) if toks else s


def _match_keys(home: str, away: str):
    """Nøgler et resultat kan slås op på: både rå og normaliseret hold-par."""
    return (
        f"{home}|{away}".lower(),
        f"{normalize_team(home)}|{normalize_team(away)}",
    )

from oddscalc import api
from oddscalc.odds import decimal_to_implied, fair_odds, remove_vig
from oddscalc.probs import EXCHANGES, SHARP_WEIGHTS, DEFAULT_WEIGHT, analyse_match


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

    # Vægtet konsensus for Over (skarpe bookmakere tæller mere).
    wsum, acc = 0.0, 0.0
    for bname, prices in books.items():
        fo, _ = remove_vig([prices["Over"], prices["Under"]])
        wt = SHARP_WEIGHTS.get(bname, DEFAULT_WEIGHT)
        acc += fo * wt
        wsum += wt
    prob_over = acc / wsum if wsum else 0.5
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
                weights=SHARP_WEIGHTS,
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
        # Alle bookmakeres 1X2-odds (i udfaldsrækkefølge) til detalje-modal.
        all_books = {
            b: [round(prices[n], 2) for n in norm["outcome_names"]]
            for b, prices in books.items()
            if all(n in prices for n in norm["outcome_names"])
        }
        match = {
            "id": ev.get("id", ""),
            "home": a.home_team,
            "away": a.away_team,
            "league": a.league or "",
            "sportKey": ev.get("sport_key", ""),
            "commence": a.commence_time or "",
            "books": a.num_bookmakers,
            "margin": round((a.avg_overround - 1) * 100, 1),
            "outcomes": outcomes,
            "allBooks": all_books,
        }
        tot = _totals(ev)
        if tot:
            match["totals"] = tot
        out.append(match)
    out.sort(key=lambda m: m["commence"])
    return out


def build_results(scores_raw: list) -> dict:
    """Byg resultat-opslag fra The Odds API /scores.

    Returnerer ``{home|away (lowercase): {"hs":int,"as":int,"commence":str}}``
    for afsluttede kampe — bruges til resultat-feed og afregning af spil.
    """
    res = {}
    for ev in scores_raw:
        if not (ev.get("completed") and ev.get("scores")):
            continue
        home, away = ev.get("home_team"), ev.get("away_team")
        smap = {s["name"]: s["score"] for s in ev["scores"]}
        try:
            hs, as_ = int(smap.get(home)), int(smap.get(away))
        except (TypeError, ValueError):
            continue
        rec = {
            "id": ev.get("id", ""),
            "home": home,
            "away": away,
            "hs": hs,
            "as": as_,
            "commence": ev.get("commence_time", ""),
            "league": ev.get("sport_title", ""),
        }
        # Slå både rå og normaliseret hold-par op, så resultater fra en anden
        # datakilde (fx football-data.org) også matcher tips fra The Odds API.
        for key in _match_keys(home, away):
            res.setdefault(key, rec)
    return res


TIP_MIN_EDGE = 0.02


def update_tips(matches: list, results: dict, built_at: str = "", history: dict = None) -> dict:
    """Vedligehold et facit-kartotek over appens value-tips.

    - Registrerer appens bedste value-udfald (EV ≥ 2%) pr. kamp som et tip.
    - Afgør ramt/forkert når kampen dukker op i resultaterne.
    - Gemmer web/tips.json og returnerer en opsummering til indlejring.
    """
    tips_path = Path(__file__).parent / "tips.json"
    tips = {}
    if tips_path.exists():
        try:
            tips = json.loads(tips_path.read_text(encoding="utf-8"))
        except ValueError:
            tips = {}

    # Slå resultater op på både event-id og hold-nøgle.
    by_id = {r["id"]: r for r in results.values() if r.get("id")}

    def result_for(tip):
        r = by_id.get(tip.get("id"))
        if r:
            return r
        for key in _match_keys(tip["home"], tip["away"]):
            r = results.get(key)
            if r:
                return r
        return None

    # 1) Registrér nye tips fra de aktuelle kampe.
    for m in matches:
        # appens anbefaling = udfald med højeste EV (uden børser), hvis value.
        best = None
        for i, o in enumerate(m["outcomes"]):
            if o["bestNE"] <= 0:
                continue
            edge = o["prob"] * o["bestNE"] - 1
            if best is None or edge > best[1]:
                best = (o, edge, i)
        if not best or best[1] < TIP_MIN_EDGE:
            continue
        o, edge, idx = best
        side = (["1", "X", "2"] if len(m["outcomes"]) == 3 else ["1", "2"])[idx]
        key = f"{m['id']}|{o['name']}"
        if key not in tips:
            tips[key] = {
                "id": m["id"],
                "home": m["home"],
                "away": m["away"],
                "league": m["league"],
                "commence": m["commence"],   # dato/kamptidspunkt
                "market": "1X2",             # marked
                "side": side,
                "pick": o["name"],
                "fair": o["fair"],           # dit beregnede fair odds
                "odds": o["bestNE"],         # bookmakerens (bedste) odds
                "book": o["bookNE"],         # hvilken bookmaker
                "prob": o["prob"],           # konsensus-sandsynlighed
                "edge": round(edge, 4),      # EV (andel)
                "ts": m["commence"],
                "takenAt": built_at,         # hvornår tippet blev taget (til CLV)
                "graded": False,             # vandt/tabte afgøres senere
            }

    # 2) Afgør ugraderede tips der nu har et resultat.
    for key, t in tips.items():
        if t.get("graded"):
            continue
        r = result_for(t)
        if not r:
            continue
        hs, as_ = r["hs"], r["as"]
        actual = t["home"] if hs > as_ else (t["away"] if as_ > hs else "Draw")
        t["graded"] = True
        t["win"] = t["pick"] == actual
        t["score"] = f"{hs}-{as_}"

    # 3) CLV (Closing Line Value): sammenlign de odds tippet blev taget til
    #    med en SENERE måling (tættest på kampstart) = "closing line".
    #    Positiv CLV = du fik bedre odds end markedet lukkede på = dygtigt.
    history = history or {}
    side_idx = {"1": 0, "X": 1, "2": 2}
    for t in tips.values():
        if t.get("clv") is not None:
            pass  # opdater altid, closing kan flytte sig
        mid = f"{t['home']}|{t['away']}|{t['commence']}"
        snaps = history.get(mid, [])
        taken = t.get("takenAt", "")
        later = [s for s in snaps if s.get("t", "") > taken]
        idx = side_idx.get(t.get("side"))
        if later and idx is not None:
            closing = later[-1]["h2h"][idx] if idx < len(later[-1]["h2h"]) else 0
            if closing and closing > 0:
                t["closing"] = round(closing, 2)
                t["clv"] = round(t["odds"] / closing - 1, 4)

    tips_path.write_text(
        json.dumps(tips, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    all_tips = list(tips.values())
    with_clv = [t for t in all_tips if t.get("clv") is not None]
    avg_clv = sum(t["clv"] for t in with_clv) / len(with_clv) if with_clv else 0
    beat_close = sum(1 for t in with_clv if t["clv"] > 0)
    graded = [t for t in all_tips if t.get("graded")]
    hits = [t for t in graded if t.get("win")]
    misses = [t for t in graded if not t.get("win")]
    pending = [t for t in all_tips if not t.get("graded")]
    staked = len(graded)
    profit = sum((t["odds"] - 1) if t.get("win") else -1 for t in graded)
    avg_ev = (
        sum(t.get("edge", 0) for t in all_tips) / len(all_tips) if all_tips else 0
    )
    # Hele "databasen" af anbefalinger (nyeste først), til statistiksiden.
    rows = sorted(all_tips, key=lambda t: t["commence"], reverse=True)[:400]
    return {
        "hits": len(hits),
        "misses": len(misses),
        "pending": len(pending),
        "count": len(all_tips),
        "graded": staked,
        "hitRate": round(len(hits) / staked * 100, 1) if staked else 0,
        "roi": round(profit / staked * 100, 1) if staked else 0,
        "profit": round(profit, 2),
        "avgEv": round(avg_ev * 100, 2),
        "clvCount": len(with_clv),
        "avgClv": round(avg_clv * 100, 2),
        "beatClose": beat_close,
        "beatCloseRate": round(beat_close / len(with_clv) * 100, 1) if with_clv else 0,
        "rows": rows,
        "recent": sorted(graded, key=lambda t: t["commence"], reverse=True)[:60],
    }


def main(argv: list) -> int:
    # Simpel arg-parsing: <raw.json> [out.html] [--scores <fil>]
    scores_file = None
    positional = []
    i = 0
    while i < len(argv):
        if argv[i] == "--scores" and i + 1 < len(argv):
            scores_file = argv[i + 1]
            i += 2
        else:
            positional.append(argv[i])
            i += 1
    if not positional:
        print(
            "brug: python web/build.py <raw.json> [out.html] [--scores <fil>]",
            file=sys.stderr,
        )
        return 2
    raw = json.load(open(positional[0], encoding="utf-8"))
    matches = build_matches(raw)

    results = {}
    if scores_file and Path(scores_file).exists():
        results = build_results(json.load(open(scores_file, encoding="utf-8")))

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

    # Facit + CLV (kræver historik, så det køres efter snapshot er lagt ind).
    tips_summary = update_tips(matches, results, built_at, history)
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
    res_json = json.dumps(results, ensure_ascii=False, separators=(",", ":"))

    font_path = Path(__file__).parent / "fonts.css"
    font_css = font_path.read_text(encoding="utf-8") if font_path.exists() else ""

    tips_json = json.dumps(tips_summary, ensure_ascii=False, separators=(",", ":"))
    html = (
        template.replace("/*__FONT__*/", font_css)
        .replace("/*__DATA__*/[]", data_json)
        .replace("/*__HIST__*/{}", hist_json)
        .replace("/*__RESULTS__*/{}", res_json)
        .replace("/*__TIPS__*/{}", tips_json)
        .replace("__BUILT_AT__", built_at)
    )

    out_path = (
        positional[1]
        if len(positional) > 1
        else str(Path(__file__).parent / "index.html")
    )
    Path(out_path).write_text(html, encoding="utf-8")

    # Skriv også data separat, så en hostet side kan auto-opdatere (live)
    # ved at hente data.json med jævne mellemrum — uden at bygge HTML igen.
    data_bundle = {
        "builtAt": built_at,
        "matches": matches,
        "results": results,
        "hist": embed_hist,
        "tips": tips_summary,
    }
    Path(Path(out_path).parent / "data.json").write_text(
        json.dumps(data_bundle, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    leagues = sorted({m["league"] for m in matches})
    print(
        f"Skrev {out_path}: {len(matches)} kampe, {len(leagues)} ligaer, "
        f"{len(results)} resultater."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
