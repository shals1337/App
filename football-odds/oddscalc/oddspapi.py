"""Klient til OddsPapi (api.oddspapi.io) — 380+ bookmakere, 60+ sportsgrene.

Oversætter OddsPapi's data til den *samme* form som The Odds API leverer, så
hele analysemotoren (konsensus, value, arbitrage, CLV) virker uændret.

Hvorfor OddsPapi: én forespørgsel henter ÉN bookmaker på tværs af ALLE
turneringer. Så en fuld opdatering koster ~1 forespørgsel pr. bookmaker i
stedet for én pr. liga — og der er danske bookmakere med (OddSet, Unibet DK …),
hvilket er afgørende for danske brugere: odds hos en bookmaker de ikke kan
spille hos er værdiløse.

Nøgle sættes via miljøvariablen ``ODDSPAPI_KEY``.

Brug::

    from oddscalc import oddspapi
    events = oddspapi.collect(sport_id=10, bookmakers=oddspapi.DANISH_BOOKS)
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

BASE = "https://api.oddspapi.io/v4"

# API'et beder om 500 ms mellem kald.
_MIN_INTERVAL = 0.55
_last_call = [0.0]


class OddsPapiError(RuntimeError):
    """Fejl ved kald til OddsPapi."""


# --- markeder (fodbold, sportId 10) -------------------------------------
# marketId -> betydning. Udfalds-ID'erne kommer med "home"/"draw"/"away" og
# "over"/"under" i bookmakerOutcomeId, så vi læser dem derfra.
MARKET_1X2 = "101"
MARKET_BTTS = "104"
# Over/Under hele kampen, pr. mållinje.
TOTALS_MARKETS = {
    "106": 0.5, "108": 1.5, "1010": 2.5, "1012": 3.5, "1014": 4.5,
    "1016": 5.5, "1018": 6.5, "1020": 7.5, "1022": 8.5,
    "10158": 0.25, "10160": 0.75, "10162": 1.0, "10164": 1.25,
    "10166": 1.75, "10168": 2.0, "10170": 2.25, "10172": 2.75,
    "10174": 3.0,
}

# Sportsgrene vi viser (sportId -> visningsnavn).
SPORTS = {
    10: "Fodbold", 11: "Basketball", 12: "Tennis", 13: "Baseball",
    14: "Amerikansk fodbold", 15: "Ishockey", 20: "Håndbold",
    21: "Volleyball", 22: "Snooker", 23: "Bordtennis", 24: "Rugby",
    25: "Cricket", 17: "CS (esport)", 18: "LoL (esport)",
}

# Danske bookmakere — vores primære målgruppe kan faktisk spille her.
DANISH_BOOKS = [
    "oddset", "unibet.dk", "bwin.dk", "betano.dk", "leovegas.dk",
    "expekt.dk", "mrgreen.dk", "888sport.dk", "cashpoint.dk",
    "betinia.dk", "campobet.dk", "vbet.dk",
]
# Skarpe referencer: bruges til at prissætte "sand" chance, ikke til at spille.
SHARP_BOOKS = ["pinnacle", "betfair-ex", "smarkets", "matchbook"]


def _key() -> str:
    k = os.environ.get("ODDSPAPI_KEY")
    if not k:
        raise OddsPapiError("mangler ODDSPAPI_KEY i miljøet")
    return k


def _get(path: str, _tries: int = 3, **params):
    """Kald API'et med indbygget pause, så rate-limitten overholdes."""
    wait = _MIN_INTERVAL - (time.time() - _last_call[0])
    if wait > 0:
        time.sleep(wait)
    params["apiKey"] = _key()
    url = f"{BASE}/{path}?{urllib.parse.urlencode(params)}"
    # Uden en almindelig User-Agent afvises kaldet af udbyderens CDN (403).
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; OddsCalc/1.0)",
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read()[:200]
        _last_call[0] = time.time()
        # 429 = rate limit: vent lidt og prøv igen (koster ikke ekstra kvote).
        if e.code == 429 and _tries > 1:
            time.sleep(1.5)
            return _get(path, _tries=_tries - 1, **{
                k: v for k, v in params.items() if k != "apiKey"
            })
        raise OddsPapiError(f"{path}: HTTP {e.code} {body!r}") from e
    finally:
        _last_call[0] = time.time()
    if isinstance(data, dict) and "error" in data:
        raise OddsPapiError(f"{path}: {data['error']}")
    return data


def account() -> dict:
    """Kontostatus — bl.a. hvor mange forespørgsler der er tilbage."""
    a = _get("account")
    sub = (a.get("subscriptions") or [{}])[0]
    return {
        "plan": sub.get("plan"),
        "limit": sub.get("request_limit"),
        "used": sub.get("request_count"),
        "left": (sub.get("request_limit") or 0) - (sub.get("request_count") or 0),
    }


def bookmaker_meta() -> dict:
    """``slug -> {"name", "clone_of"}`` for alle bookmakere.

    ``clone_of`` er vigtigt: kloner (fx Betano DK af Betano) må ikke tælle som
    uafhængige bookmakere i konsensus, ellers overdrives value.
    """
    out = {}
    for b in _get("bookmakers"):
        out[b["slug"]] = {
            "name": b.get("bookmakerName") or b["slug"],
            "clone_of": b.get("cloneOf"),
        }
    return out


def fixtures(sport_id: int, days: int = 7) -> list:
    """Kommende kampe for en sportsgren, med holdnavne og turnering."""
    today = datetime.now(timezone.utc).date()
    data = _get(
        "fixtures",
        sportId=sport_id,
        **{
            "from": today.isoformat(),
            "to": (today + timedelta(days=days)).isoformat(),
        },
    )
    items = data if isinstance(data, list) else data.get("data", [])
    # Kun kampe der faktisk har odds og ikke er gået i gang.
    return [f for f in items if f.get("hasOdds")]


def odds_for(bookmaker: str, tournament_ids: list, chunk: int = 5) -> dict:
    """Odds fra ÉN bookmaker på tværs af mange turneringer.

    Returnerer ``fixtureId -> markets``. API'et tillader højst 5 turneringer
    pr. kald, så listen deles i bidder — hver bid koster én forespørgsel.
    Samlet pris for en opdatering = bookmakere x ceil(turneringer / 5).
    """
    found = {}
    ids = [str(t) for t in tournament_ids]
    for i in range(0, len(ids), chunk):
        part = ids[i:i + chunk]
        try:
            data = _get(
                "odds-by-tournaments",
                bookmaker=bookmaker,
                tournamentIds=",".join(part),
                oddsFormat="decimal",
            )
        except OddsPapiError as e:
            print(f"  ! {bookmaker}: {e}")
            continue
        for fx in data if isinstance(data, list) else []:
            bo = (fx.get("bookmakerOdds") or {}).get(bookmaker)
            if not bo or bo.get("suspended"):
                continue
            found[fx["fixtureId"]] = bo.get("markets") or {}
    return found


def _price(outcome: dict):
    """Træk decimal-prisen ud af et udfald (kun hovedlinjen, aktiv pris)."""
    players = outcome.get("players") or {}
    p = players.get("0") or (next(iter(players.values()), None) if players else None)
    if not isinstance(p, dict) or not p.get("active"):
        return None
    try:
        price = float(p["price"])
    except (KeyError, TypeError, ValueError):
        return None
    return price if price > 1.0 else None


_CATALOG_CACHE = {}


def markets_catalog(sport_id: int) -> dict:
    """``{marketId: {"type","handicap",{outcomeId: navn}}}`` for en sportsgren.

    Kataloget er den pålidelige måde at afkode udfald på: hver bookmaker har
    sit eget ``bookmakerOutcomeId``, men udfaldets *nøgle* er den samme på
    tværs af alle bookmakere (fx marked 101 → 101="1", 102="X", 103="2").
    Fungerer for alle sportsgrene, ikke kun fodbold.
    """
    if sport_id in _CATALOG_CACHE:
        return _CATALOG_CACHE[sport_id]
    cat = {}
    for m in _get("markets", sportId=sport_id):
        if m.get("playerProp"):
            continue  # spiller-markeder bruger vi ikke (endnu)
        cat[str(m["marketId"])] = {
            "type": m.get("marketType"),
            "handicap": m.get("handicap"),
            "period": m.get("period"),
            "outcomes": {
                str(o["outcomeId"]): o["outcomeName"]
                for o in m.get("outcomes") or []
            },
        }
    _CATALOG_CACHE[sport_id] = cat
    return cat


def _h2h_market(markets: dict, catalog: dict, home: str, away: str):
    """Byg et h2h-marked (1X2 eller 2-vejs) i The Odds API-form."""
    # Find kampvinder-markedet: 1x2 (fodbold) eller moneyline (fx basketball).
    for mid, m in markets.items():
        spec = catalog.get(mid)
        if not spec or spec["type"] not in ("1x2", "moneyline"):
            continue
        if spec.get("period") not in (None, "fulltime"):
            continue
        if not m.get("marketActive"):
            continue
        # Udfaldsnavn "1"/"X"/"2" oversættes til holdnavne.
        label = {"1": home, "X": "Draw", "2": away,
                 "Home": home, "Draw": "Draw", "Away": away}
        outcomes = []
        for oid, o in (m.get("outcomes") or {}).items():
            name = spec["outcomes"].get(oid)
            price = _price(o)
            if name in label and price:
                outcomes.append({"name": label[name], "price": price})
        names = {o["name"] for o in outcomes}
        if home in names and away in names:
            return {"key": "h2h", "outcomes": outcomes}
    return None


def _totals_market(markets: dict, catalog: dict):
    """Vælg over/under — helst 2.5 mål, ellers nærmeste tilgængelige linje."""
    best = None
    for mid, m in markets.items():
        spec = catalog.get(mid)
        if not spec or spec["type"] != "totals" or not m.get("marketActive"):
            continue
        if spec.get("period") not in (None, "fulltime"):
            continue
        point = spec.get("handicap")
        if point is None:
            continue
        outcomes = []
        for oid, o in (m.get("outcomes") or {}).items():
            name = (spec["outcomes"].get(oid) or "").lower()
            price = _price(o)
            if name in ("over", "under") and price:
                outcomes.append(
                    {"name": name.capitalize(), "price": price, "point": point}
                )
        if len(outcomes) == 2:
            # Foretræk linjen tættest på 2.5 (den mest handlede).
            rank = abs(float(point) - 2.5)
            if best is None or rank < best[0]:
                best = (rank, {"key": "totals", "outcomes": outcomes})
    return best[1] if best else None


def collect(sport_id: int = 10, bookmakers: list = None, days: int = 7,
            max_tournaments: int = None) -> list:
    """Hent alt og returnér kampe i The Odds API's form.

    Én forespørgsel pr. bookmaker (plus én til kampene), så det er billigt
    at have mange bookmakere med.
    """
    books = list(bookmakers or (DANISH_BOOKS + SHARP_BOOKS))
    meta = bookmaker_meta()
    catalog = markets_catalog(sport_id)

    fx = fixtures(sport_id, days=days)
    if not fx:
        return []
    by_id = {f["fixtureId"]: f for f in fx}
    tids = sorted({f["tournamentId"] for f in fx})
    if max_tournaments:
        # Prioritér turneringer med flest kampe.
        counts = {}
        for f in fx:
            counts[f["tournamentId"]] = counts.get(f["tournamentId"], 0) + 1
        tids = sorted(counts, key=lambda t: -counts[t])[:max_tournaments]
        keep = set(tids)
        by_id = {k: v for k, v in by_id.items() if v["tournamentId"] in keep}

    # fixtureId -> {bookmaker-slug: markets}
    per_fixture = {}
    for slug in books:
        got = odds_for(slug, tids)
        for fid, markets in got.items():
            if fid in by_id:
                per_fixture.setdefault(fid, {})[slug] = markets
        print(f"  {meta.get(slug, {}).get('name', slug):22} {len(got):5d} kampe")

    events = []
    for fid, books_markets in per_fixture.items():
        f = by_id[fid]
        home = f.get("participant1Name") or ""
        away = f.get("participant2Name") or ""
        if not home or not away:
            continue
        # Klon-værn: hvis både en bookmaker og dens klon er hentet, giver de
        # identiske odds. Tages begge med, tælles den samme pris to gange og
        # konsensus (og dermed value) bliver kunstigt skæv. Behold forælderen.
        present = set(books_markets)
        drop = {
            slug for slug in present
            if (meta.get(slug, {}).get("clone_of") or "") in present
        }

        bms = []
        for slug, markets in books_markets.items():
            if slug in drop:
                continue
            info = meta.get(slug, {})
            mk = []
            h2h = _h2h_market(markets, catalog, home, away)
            if h2h:
                mk.append(h2h)
            tot = _totals_market(markets, catalog)
            if tot:
                mk.append(tot)
            if not mk:
                continue
            bms.append({
                "key": slug,
                "title": info.get("name", slug),
                # Egne felter — bruges til ærlig konsensus og danske filtre.
                "cloneOf": info.get("clone_of"),
                "isDanish": slug in DANISH_BOOKS,
                "markets": mk,
            })
        if not bms:
            continue
        league = f.get("tournamentName") or ""
        cat = f.get("categoryName") or ""
        events.append({
            "id": str(fid),
            "sport_key": f"sport_{f.get('sportId')}",
            "sport_title": f"{league}" + (f" ({cat})" if cat else ""),
            "sport_name": SPORTS.get(f.get("sportId"), f.get("sportName") or ""),
            "country": cat,
            "commence_time": f.get("startTime") or "",
            "home_team": home,
            "away_team": away,
            "bookmakers": bms,
        })
    return events
