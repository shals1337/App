"""Bookmakere skal genkendes på tværs af datakilder.

Samme bookmaker staves forskelligt hos forskellige udbydere ("Pinnacle" vs
"Pinnacle Sports"). Gør vi ikke noget ved det, sker to ting der begge
forvrider tallene brugerne spiller efter:

1. Skarpe bookmakere får standardvægt i stedet for deres høje vægt, så
   konsensus-sandsynligheden bliver mindre præcis.
2. Ved fletning af to kilder tælles den samme pris to gange, så én
   bookmakers holdning fylder dobbelt i konsensus.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "web"))

from oddscalc.probs import SHARP_WEIGHTS, analyse_match, canonical_book, is_exchange


def test_navnevarianter_giver_samme_noegle():
    assert canonical_book("Pinnacle Sports") == canonical_book("Pinnacle")
    assert canonical_book("BetFair Exchange") == canonical_book("Betfair")
    assert canonical_book("Betano DK") == canonical_book("Betano")
    assert canonical_book("888Sport DK") == canonical_book("888Sport")


def test_forskellige_bookmakere_forbliver_forskellige():
    assert canonical_book("bet365") != canonical_book("Betano")
    assert canonical_book("Unibet") != canonical_book("Betsson")
    assert canonical_book("OddSet") != canonical_book("Expekt")


def test_boerser_genkendes_trods_navnevariant():
    assert is_exchange("Betfair")
    assert is_exchange("BetFair Exchange")
    assert is_exchange("Smarkets")
    assert not is_exchange("bet365")
    assert not is_exchange("OddSet")


def test_skarp_vaegt_uafhaengig_af_stavemaade():
    """Pinnacle skal vægte 3x, uanset om kilden kalder den "Pinnacle Sports"."""
    skarp = {"H": 2.00, "Draw": 3.50, "A": 4.00}
    lille = {"H": 2.50, "Draw": 3.50, "A": 3.00}

    a = analyse_match(
        "H", "A", ["H", "Draw", "A"],
        {"Pinnacle": skarp, "Small": lille}, weights=SHARP_WEIGHTS,
    )
    b = analyse_match(
        "H", "A", ["H", "Draw", "A"],
        {"Pinnacle Sports": skarp, "Small": lille}, weights=SHARP_WEIGHTS,
    )
    assert abs(
        a.outcomes[0].consensus_prob - b.outcomes[0].consensus_prob
    ) < 1e-12

    # Og vægtningen skal faktisk gøre en forskel (ellers tester vi ingenting).
    uvaegtet = analyse_match(
        "H", "A", ["H", "Draw", "A"], {"Pinnacle": skarp, "Small": lille}
    )
    assert abs(
        uvaegtet.outcomes[0].consensus_prob - a.outcomes[0].consensus_prob
    ) > 1e-6


def _event(home, away, books, day="2026-08-05"):
    return {
        "home_team": home,
        "away_team": away,
        "commence_time": f"{day}T18:00:00Z",
        "sport_title": "Test",
        "bookmakers": [
            {
                "title": title,
                "isDanish": dansk,
                "markets": [{
                    "key": "h2h",
                    "outcomes": [
                        {"name": home, "price": 2.0},
                        {"name": "Draw", "price": 3.4},
                        {"name": away, "price": 3.8},
                    ],
                }],
            }
            for title, dansk in books
        ],
    }


def test_fletning_taeller_ikke_samme_bookmaker_to_gange():
    import build

    merged = build.merge_events(
        [_event("Home", "Away", [("Pinnacle", False), ("bet365", False)])],
        [_event("Home", "Away", [("Pinnacle Sports", False), ("OddSet", True)])],
    )
    assert len(merged) == 1
    navne = [b["title"] for b in merged[0]["bookmakers"]]
    assert len(navne) == 3, navne
    nøgler = {canonical_book(n) for n in navne}
    assert len(nøgler) == 3


def test_fletning_foretraekker_dansk_udgave():
    """Brugeren skal se "Betano DK" — der kan de faktisk spille."""
    import build

    merged = build.merge_events(
        [_event("Home", "Away", [("Betano", False)])],
        [_event("Home", "Away", [("Betano DK", True)])],
    )
    assert [b["title"] for b in merged[0]["bookmakers"]] == ["Betano DK"]


def test_fletning_blander_ikke_forskellige_kampe():
    import build

    merged = build.merge_events(
        [_event("Real Madrid", "Barcelona", [("Pinnacle", False)])],
        [_event("Atletico Madrid", "Barcelona", [("OddSet", True)])],
    )
    assert len(merged) == 2
