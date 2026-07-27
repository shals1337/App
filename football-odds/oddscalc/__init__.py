"""oddscalc - beregn fodbold-sandsynligheder ud fra live odds.

Pakken indeholder:
- odds:    konvertering mellem odds-formater og fjernelse af bookmaker-margin
- probs:   konsensus-sandsynligheder og value-bet analyse på tværs af bookmakere
- api:     klient til The Odds API (live odds)
- demo:    indbygget testdata så app'en kan køre uden API-nøgle
"""

from .odds import (
    decimal_to_implied,
    american_to_decimal,
    fractional_to_decimal,
    remove_vig,
    overround,
)
from .probs import (
    Outcome,
    MatchAnalysis,
    analyse_match,
)

__all__ = [
    "decimal_to_implied",
    "american_to_decimal",
    "fractional_to_decimal",
    "remove_vig",
    "overround",
    "Outcome",
    "MatchAnalysis",
    "analyse_match",
]

__version__ = "0.1.0"
