"""Klient til The Odds API (https://the-odds-api.com) — rigtige, live odds.

The Odds API har et gratis tier (typisk 500 requests/måned). Opret en konto,
hent din API-nøgle og sæt den som miljøvariabel::

    export ODDS_API_KEY="din_noegle_her"

Uden nøgle kan app'en køre i demo-mode med indbygget testdata (se demo.py).
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Dict, List, Optional

API_BASE = "https://api.the-odds-api.com/v4"

# Et par almindelige fodbold-ligaer (The Odds API "sport keys").
SPORTS = {
    "epl": "soccer_epl",                     # Premier League
    "laliga": "soccer_spain_la_liga",        # La Liga
    "bundesliga": "soccer_germany_bundesliga",
    "seriea": "soccer_italy_serie_a",
    "ligue1": "soccer_france_ligue_one",
    "ucl": "soccer_uefa_champs_league",      # Champions League
    "superliga": "soccer_denmark_superliga", # Dansk Superliga
}


class OddsAPIError(RuntimeError):
    """Rejst når et kald til The Odds API fejler."""


def _request(path: str, params: Dict[str, str]) -> object:
    url = f"{API_BASE}{path}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")
        raise OddsAPIError(
            f"HTTP {exc.code} fra The Odds API: {detail}"
        ) from exc
    except urllib.error.URLError as exc:
        raise OddsAPIError(f"Netværksfejl mod The Odds API: {exc}") from exc


def get_api_key(explicit: Optional[str] = None) -> Optional[str]:
    """Find API-nøglen: eksplicit argument > miljøvariabel ODDS_API_KEY."""
    return explicit or os.environ.get("ODDS_API_KEY")


def fetch_odds(
    sport_key: str,
    api_key: str,
    regions: str = "eu,uk",
    markets: str = "h2h",
) -> List[dict]:
    """Hent live odds for en liga.

    ``h2h`` (head-to-head) er 1X2-markedet: hjemmesejr / uafgjort / udesejr.
    ``regions`` styrer hvilke bookmakere der medtages.

    Returnerer den rå liste af kampe fra API'et. Brug
    :func:`normalise_event` for at få den til analyse-formatet.
    """
    return _request(
        f"/sports/{sport_key}/odds",
        {
            "apiKey": api_key,
            "regions": regions,
            "markets": markets,
            "oddsFormat": "decimal",
        },
    )  # type: ignore[return-value]


def normalise_event(event: dict) -> dict:
    """Omform en rå The Odds API-kamp til analyse-formatet.

    Returnerer::

        {
            "home_team": str,
            "away_team": str,
            "commence_time": str,
            "outcome_names": [home, "Draw", away],
            "bookmaker_odds": {bookmaker: {udfald: odds}},
        }

    Rækkefølgen af udfald er altid hjemme, uafgjort, ude — så CLI'en kan
    vise 1 / X / 2 konsistent.
    """
    home = event["home_team"]
    away = event["away_team"]
    outcome_names = [home, "Draw", away]

    bookmaker_odds: Dict[str, Dict[str, float]] = {}
    for book in event.get("bookmakers", []):
        for market in book.get("markets", []):
            if market.get("key") != "h2h":
                continue
            prices = {
                o["name"]: float(o["price"]) for o in market.get("outcomes", [])
            }
            # Behold kun bookmakere med alle tre priser.
            if all(name in prices for name in outcome_names):
                bookmaker_odds[book["title"]] = prices

    return {
        "home_team": home,
        "away_team": away,
        "commence_time": event.get("commence_time"),
        "outcome_names": outcome_names,
        "bookmaker_odds": bookmaker_odds,
    }
