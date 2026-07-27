"""Sandsynligheds-analyse: konsensus og value bets på tværs af bookmakere.

Idéen: en enkelt bookmakers odds er farvet af margin og af den enkelte
bookmakers holdning. Ved at rense hver bookmakers marked for margin og tage
gennemsnittet på tværs af mange bookmakere får vi et robust bud på den
*sande* sandsynlighed for hvert udfald. Hvis en bookmaker så tilbyder odds
der er bedre end den fair konsensus-odds, har vi fundet et value bet
(positiv forventet værdi).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from statistics import mean
from typing import Dict, List, Optional

from .odds import decimal_to_implied, fair_odds, remove_vig


@dataclass
class Outcome:
    """Analyse af ét udfald (fx hjemmesejr) i en kamp."""

    name: str
    consensus_prob: float           # konsensus-sandsynlighed (0-1)
    fair_decimal_odds: float        # fair odds svarende til konsensus
    best_odds: float                # bedste tilgængelige odds på markedet
    best_bookmaker: str             # hvem der tilbyder bedste odds
    edge: float                     # forventet værdi pr. indsat krone (kan være negativ)

    @property
    def consensus_pct(self) -> float:
        return self.consensus_prob * 100.0

    @property
    def is_value(self) -> bool:
        """True hvis bedste odds giver positiv forventet værdi."""
        return self.edge > 0.0


@dataclass
class MatchAnalysis:
    """Samlet analyse af én kamp."""

    home_team: str
    away_team: str
    commence_time: Optional[str]
    outcomes: List[Outcome]
    num_bookmakers: int
    avg_overround: float            # gns. margin på tværs af bookmakere
    league: Optional[str] = None

    @property
    def value_bets(self) -> List[Outcome]:
        return [o for o in self.outcomes if o.is_value]


def _fair_probs_per_bookmaker(
    bookmaker_odds: Dict[str, Dict[str, float]],
    outcome_names: List[str],
) -> List[List[float]]:
    """Rens hver bookmakers marked for margin.

    Returnerer en liste (én pr. bookmaker) af fair sandsynligheder, i samme
    rækkefølge som ``outcome_names``. Bookmakere der ikke har priser på alle
    udfald springes over.
    """
    per_bookmaker: List[List[float]] = []
    for prices in bookmaker_odds.values():
        if not all(name in prices for name in outcome_names):
            continue
        market = [prices[name] for name in outcome_names]
        per_bookmaker.append(remove_vig(market))
    return per_bookmaker


def analyse_match(
    home_team: str,
    away_team: str,
    outcome_names: List[str],
    bookmaker_odds: Dict[str, Dict[str, float]],
    commence_time: Optional[str] = None,
    league: Optional[str] = None,
) -> MatchAnalysis:
    """Beregn konsensus-sandsynligheder og value bets for én kamp.

    Parametre
    ---------
    outcome_names:
        Udfaldenes navne i fast rækkefølge, fx ``[home, "Draw", away]``.
    bookmaker_odds:
        ``{bookmaker_navn: {udfald_navn: decimal_odds}}``.

    For hvert udfald udregnes:
    - konsensus-sandsynlighed = gennemsnit af de margin-rensede
      sandsynligheder på tværs af bookmakere,
    - bedste tilgængelige odds og hvem der tilbyder dem,
    - edge = konsensus_sandsynlighed * bedste_odds - 1 (forventet værdi).
    """
    if not outcome_names:
        raise ValueError("mindst ét udfald kræves")

    fair_per_book = _fair_probs_per_bookmaker(bookmaker_odds, outcome_names)
    if not fair_per_book:
        raise ValueError(
            "ingen bookmaker har komplette priser for alle udfald"
        )

    # Konsensus-sandsynlighed pr. udfald = gennemsnit på tværs af bookmakere.
    consensus = [
        mean(book[i] for book in fair_per_book)
        for i in range(len(outcome_names))
    ]

    # Gennemsnitlig margin (til info om hvor "dyrt" markedet er).
    overrounds = []
    for prices in bookmaker_odds.values():
        if all(name in prices for name in outcome_names):
            overrounds.append(
                sum(decimal_to_implied(prices[n]) for n in outcome_names)
            )
    avg_over = mean(overrounds) if overrounds else 1.0

    outcomes: List[Outcome] = []
    for i, name in enumerate(outcome_names):
        prob = consensus[i]

        # Find bedste (højeste) odds for dette udfald på tværs af bookmakere.
        best_book = ""
        best_odds = 0.0
        for book_name, prices in bookmaker_odds.items():
            if name in prices and prices[name] > best_odds:
                best_odds = prices[name]
                best_book = book_name

        # Forventet værdi pr. indsat krone: p * odds - 1.
        edge = prob * best_odds - 1.0 if best_odds > 0 else -1.0

        outcomes.append(
            Outcome(
                name=name,
                consensus_prob=prob,
                fair_decimal_odds=fair_odds(prob),
                best_odds=best_odds,
                best_bookmaker=best_book,
                edge=edge,
            )
        )

    return MatchAnalysis(
        home_team=home_team,
        away_team=away_team,
        commence_time=commence_time,
        outcomes=outcomes,
        num_bookmakers=len(fair_per_book),
        avg_overround=avg_over,
        league=league,
    )
