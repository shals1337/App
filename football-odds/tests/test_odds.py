import math

import pytest

from oddscalc.odds import (
    american_to_decimal,
    decimal_to_implied,
    fair_odds,
    fractional_to_decimal,
    overround,
    remove_vig,
)


def test_decimal_to_implied():
    assert decimal_to_implied(2.0) == pytest.approx(0.5)
    assert decimal_to_implied(4.0) == pytest.approx(0.25)


def test_decimal_to_implied_invalid():
    with pytest.raises(ValueError):
        decimal_to_implied(1.0)
    with pytest.raises(ValueError):
        decimal_to_implied(0.5)


def test_american_to_decimal():
    assert american_to_decimal(150) == pytest.approx(2.5)
    assert american_to_decimal(-200) == pytest.approx(1.5)
    with pytest.raises(ValueError):
        american_to_decimal(0)


def test_fractional_to_decimal():
    assert fractional_to_decimal(5, 2) == pytest.approx(3.5)
    assert fractional_to_decimal(1, 1) == pytest.approx(2.0)
    with pytest.raises(ValueError):
        fractional_to_decimal(1, 0)


def test_overround_has_margin():
    # Typiske 1X2-odds har en overround > 1.
    over = overround([2.10, 3.40, 3.60])
    assert over > 1.0
    assert over == pytest.approx(1.0 / 2.10 + 1.0 / 3.40 + 1.0 / 3.60)


def test_remove_vig_sums_to_one():
    fair = remove_vig([2.10, 3.40, 3.60])
    assert math.isclose(sum(fair), 1.0, abs_tol=1e-9)
    # Favoritten skal stadig have højest sandsynlighed.
    assert fair[0] == max(fair)


def test_remove_vig_empty():
    with pytest.raises(ValueError):
        remove_vig([])


def test_fair_odds_roundtrip():
    assert fair_odds(0.25) == pytest.approx(4.0)
    p = 0.4
    assert decimal_to_implied(fair_odds(p)) == pytest.approx(p)
    with pytest.raises(ValueError):
        fair_odds(1.0)
