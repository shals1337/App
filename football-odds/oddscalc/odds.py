"""Odds-matematik: konvertering mellem formater og fjernelse af margin.

Alle funktioner arbejder internt med *decimal odds* (europæisk format), fordi
det er det format der gør sandsynligheds-regning nemmest: den implicitte
sandsynlighed er simpelthen ``1 / odds``.
"""

from __future__ import annotations

from typing import Iterable, List


def decimal_to_implied(decimal_odds: float) -> float:
    """Implicit sandsynlighed for et enkelt udfald ud fra decimal odds.

    Odds 2.00 -> 0.50 (50%), odds 4.00 -> 0.25 (25%).
    Bemærk at summen af implicitte sandsynligheder for alle udfald i et
    marked altid er > 1 pga. bookmakerens margin (se :func:`overround`).
    """
    if decimal_odds <= 1.0:
        raise ValueError(f"decimal odds skal være > 1.0, fik {decimal_odds}")
    return 1.0 / decimal_odds


def american_to_decimal(american_odds: float) -> float:
    """Konverter amerikanske (moneyline) odds til decimal odds.

    +150 -> 2.50, -200 -> 1.50.
    """
    if american_odds == 0:
        raise ValueError("amerikanske odds kan ikke være 0")
    if american_odds > 0:
        return 1.0 + american_odds / 100.0
    return 1.0 + 100.0 / abs(american_odds)


def fractional_to_decimal(numerator: float, denominator: float) -> float:
    """Konverter brøk-odds (britisk format) til decimal odds.

    5/2 -> 3.50, 1/1 (evens) -> 2.00.
    """
    if denominator <= 0:
        raise ValueError("nævneren skal være > 0")
    return 1.0 + numerator / denominator


def overround(decimal_odds: Iterable[float]) -> float:
    """Bookmakerens margin ("overround" / vig) for et marked.

    Returnerer summen af implicitte sandsynligheder. En værdi på 1.05 betyder
    en margin på 5% oven i de fair sandsynligheder — det er bookmakerens
    indbyggede fortjeneste.
    """
    return sum(decimal_to_implied(o) for o in decimal_odds)


def remove_vig(decimal_odds: List[float]) -> List[float]:
    """Fjern bookmakerens margin og returnér *fair* sandsynligheder.

    Bruger normaliserings-metoden: hver implicit sandsynlighed skaleres så
    summen bliver præcis 1.0. Resultatet er bookmakerens bedste bud på de
    sande sandsynligheder, renset for margin.

    Eksempel: odds [2.10, 3.40, 3.60] har overround ~1.04. Efter rensning
    summer sandsynlighederne til 1.0.
    """
    if not decimal_odds:
        raise ValueError("mindst ét udfald kræves")
    implied = [decimal_to_implied(o) for o in decimal_odds]
    total = sum(implied)
    return [p / total for p in implied]


def fair_odds(probability: float) -> float:
    """De 'fair' decimal odds der svarer til en given sandsynlighed.

    Sandsynlighed 0.25 -> odds 4.00. Bruges til at vise hvad odds *burde*
    være hvis der ingen margin var.
    """
    if not 0.0 < probability < 1.0:
        raise ValueError("sandsynlighed skal være mellem 0 og 1 (eksklusiv)")
    return 1.0 / probability
