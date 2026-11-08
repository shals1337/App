"""Ubrugelige kvoteringer må ikke vælte et helt build.

Datakilderne leverer af og til odds på præcis 1.00 for et marked der er
suspenderet eller allerede afgjort. Det er ikke en pris man kan spille til,
og den kan ikke margin-renses (1/1.00 = 100% sandsynlighed). Før dette
værn stoppede én sådan kvotering hele den ugentlige opdatering med
``ValueError: decimal odds skal være > 1.0``.

Den rigtige opførsel er at udelade den bookmaker for den kamp og bygge
videre på resten.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "web"))

from oddscalc import api


def _event(h2h_prices, totals_prices=None):
    """Byg en kamp med én bookmaker, evt. med over/under."""
    markets = [{
        "key": "h2h",
        "outcomes": [{"name": n, "price": p} for n, p in h2h_prices.items()],
    }]
    if totals_prices:
        markets.append({
            "key": "totals",
            "outcomes": [
                {"name": n, "price": p, "point": 2.5}
                for n, p in totals_prices.items()
            ],
        })
    return {
        "id": "x1",
        "home_team": "Home",
        "away_team": "Away",
        "commence_time": "2026-11-09T18:00:00Z",
        "sport_title": "Test",
        "bookmakers": [{"title": "SuspendedBook", "markets": markets}],
    }


def test_h2h_kvotering_paa_1_00_udelades():
    ev = _event({"Home": 1.0, "Draw": 1.0, "Away": 1.0})
    norm = api.normalise_event(ev)
    assert norm["bookmaker_odds"] == {}


def test_gyldige_bookmakere_bevares_naar_en_er_suspenderet():
    ev = _event({"Home": 2.0, "Draw": 3.4, "Away": 3.8})
    ev["bookmakers"].append({
        "title": "GoodBook",
        "markets": [{"key": "h2h", "outcomes": [
            {"name": "Home", "price": 2.1},
            {"name": "Draw", "price": 3.3},
            {"name": "Away", "price": 3.7},
        ]}],
    })
    ev["bookmakers"][0]["markets"][0]["outcomes"][0]["price"] = 1.0
    norm = api.normalise_event(ev)
    assert "GoodBook" in norm["bookmaker_odds"]
    assert "SuspendedBook" not in norm["bookmaker_odds"]


def test_build_matches_vaelter_ikke_paa_totals_1_00():
    import build

    ev = _event(
        {"Home": 2.0, "Draw": 3.4, "Away": 3.8},
        totals_prices={"Over": 1.0, "Under": 1.0},
    )
    # Må ikke kaste — kampen skal bygges, bare uden over/under.
    out = build.build_matches([ev])
    assert len(out) == 1
    assert "totals" not in out[0]


def test_build_matches_beholder_gyldige_totals():
    import build

    ev = _event(
        {"Home": 2.0, "Draw": 3.4, "Away": 3.8},
        totals_prices={"Over": 1.95, "Under": 1.85},
    )
    out = build.build_matches([ev])
    assert out[0]["totals"]["point"] == 2.5
