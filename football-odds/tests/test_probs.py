import pytest

from oddscalc.api import normalise_event
from oddscalc.demo import demo_events
from oddscalc.probs import analyse_match


def test_analyse_match_consensus_sums_to_one():
    a = analyse_match(
        home_team="A",
        away_team="B",
        outcome_names=["A", "Draw", "B"],
        bookmaker_odds={
            "Book1": {"A": 2.10, "Draw": 3.40, "B": 3.60},
            "Book2": {"A": 2.05, "Draw": 3.50, "B": 3.70},
        },
    )
    total = sum(o.consensus_prob for o in a.outcomes)
    assert total == pytest.approx(1.0, abs=1e-9)
    assert a.num_bookmakers == 2


def test_value_bet_detected():
    # Book2 giver klart bedre odds på "B" end de andre -> value.
    a = analyse_match(
        home_team="A",
        away_team="B",
        outcome_names=["A", "Draw", "B"],
        bookmaker_odds={
            "Book1": {"A": 2.10, "Draw": 3.40, "B": 3.60},
            "Book2": {"A": 2.10, "Draw": 3.40, "B": 5.50},
            "Book3": {"A": 2.10, "Draw": 3.40, "B": 3.55},
        },
    )
    b_outcome = next(o for o in a.outcomes if o.name == "B")
    assert b_outcome.best_bookmaker == "Book2"
    assert b_outcome.best_odds == 5.50
    assert b_outcome.is_value


def test_incomplete_bookmaker_skipped():
    a = analyse_match(
        home_team="A",
        away_team="B",
        outcome_names=["A", "Draw", "B"],
        bookmaker_odds={
            "Full": {"A": 2.10, "Draw": 3.40, "B": 3.60},
            "Partial": {"A": 2.10, "Draw": 3.40},  # mangler B
        },
    )
    # Kun den komplette bookmaker tæller i konsensus.
    assert a.num_bookmakers == 1


def test_no_complete_bookmaker_raises():
    with pytest.raises(ValueError):
        analyse_match(
            home_team="A",
            away_team="B",
            outcome_names=["A", "Draw", "B"],
            bookmaker_odds={"Partial": {"A": 2.10, "Draw": 3.40}},
        )


def test_demo_events_analyse():
    for ev in demo_events():
        a = analyse_match(
            home_team=ev["home_team"],
            away_team=ev["away_team"],
            outcome_names=ev["outcome_names"],
            bookmaker_odds=ev["bookmaker_odds"],
        )
        assert len(a.outcomes) == 3
        assert sum(o.consensus_prob for o in a.outcomes) == pytest.approx(1.0)


def test_normalise_event():
    raw = {
        "home_team": "A",
        "away_team": "B",
        "commence_time": "2026-01-01T00:00:00Z",
        "bookmakers": [
            {
                "title": "Book1",
                "markets": [
                    {
                        "key": "h2h",
                        "outcomes": [
                            {"name": "A", "price": 2.10},
                            {"name": "Draw", "price": 3.40},
                            {"name": "B", "price": 3.60},
                        ],
                    }
                ],
            }
        ],
    }
    ev = normalise_event(raw)
    assert ev["outcome_names"] == ["A", "Draw", "B"]
    assert ev["bookmaker_odds"]["Book1"]["A"] == 2.10
