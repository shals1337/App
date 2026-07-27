"""Indbygget demo-data så app'en kan køre uden API-nøgle.

Formatet matcher output fra :func:`oddscalc.api.normalise_event`, så demo og
live-data kører gennem præcis den samme analyse-kode.
"""

from __future__ import annotations

from typing import List

# Realistiske 1X2-odds fra flere bookmakere for et par opdigtede kampe.
DEMO_EVENTS: List[dict] = [
    {
        "home_team": "FC København",
        "away_team": "Brøndby IF",
        "commence_time": "2026-07-27T17:00:00Z",
        "outcome_names": ["FC København", "Draw", "Brøndby IF"],
        "bookmaker_odds": {
            "Bet365": {"FC København": 1.85, "Draw": 3.60, "Brøndby IF": 4.20},
            "Unibet": {"FC København": 1.88, "Draw": 3.55, "Brøndby IF": 4.10},
            "Danske Spil": {"FC København": 1.83, "Draw": 3.70, "Brøndby IF": 4.50},
            "Pinnacle": {"FC København": 1.91, "Draw": 3.65, "Brøndby IF": 4.05},
        },
    },
    {
        "home_team": "Manchester City",
        "away_team": "Arsenal",
        "commence_time": "2026-07-28T14:30:00Z",
        "outcome_names": ["Manchester City", "Draw", "Arsenal"],
        "bookmaker_odds": {
            "Bet365": {"Manchester City": 1.95, "Draw": 3.80, "Arsenal": 3.90},
            "Unibet": {"Manchester City": 1.97, "Draw": 3.75, "Arsenal": 3.85},
            "William Hill": {"Manchester City": 1.93, "Draw": 3.90, "Arsenal": 4.00},
            "Pinnacle": {"Manchester City": 2.02, "Draw": 3.70, "Arsenal": 3.80},
        },
    },
    {
        "home_team": "Real Madrid",
        "away_team": "FC Barcelona",
        "commence_time": "2026-07-29T20:00:00Z",
        "outcome_names": ["Real Madrid", "Draw", "FC Barcelona"],
        "bookmaker_odds": {
            "Bet365": {"Real Madrid": 2.40, "Draw": 3.50, "FC Barcelona": 2.80},
            "Unibet": {"Real Madrid": 2.38, "Draw": 3.55, "FC Barcelona": 2.85},
            "Danske Spil": {"Real Madrid": 2.45, "Draw": 3.45, "FC Barcelona": 2.75},
            "Pinnacle": {"Real Madrid": 2.44, "Draw": 3.52, "FC Barcelona": 2.90},
        },
    },
]


def demo_events() -> List[dict]:
    """Returnér en kopi af demo-kampene i analyse-format."""
    return [dict(e) for e in DEMO_EVENTS]
