"""Kommandolinje-app til fodbold-odds analyse.

Brug::

    # Demo-mode (ingen API-nøgle nødvendig)
    python -m oddscalc --demo

    # Live odds (kræver ODDS_API_KEY)
    python -m oddscalc --league epl
    python -m oddscalc --league superliga --min-edge 0.03

    # Liste over understøttede ligaer
    python -m oddscalc --list-leagues
"""

from __future__ import annotations

import argparse
import sys
from typing import List, Optional

from . import api
from .demo import demo_events
from .probs import EXCHANGES, MatchAnalysis, analyse_match


def _analyse_events(
    events: List[dict], exclude_exchanges: bool = False
) -> List[MatchAnalysis]:
    exclude = EXCHANGES if exclude_exchanges else set()
    analyses: List[MatchAnalysis] = []
    for ev in events:
        if not ev.get("bookmaker_odds"):
            continue
        try:
            analyses.append(
                analyse_match(
                    home_team=ev["home_team"],
                    away_team=ev["away_team"],
                    outcome_names=ev["outcome_names"],
                    bookmaker_odds=ev["bookmaker_odds"],
                    commence_time=ev.get("commence_time"),
                    league=ev.get("league"),
                    exclude_from_best=exclude,
                )
            )
        except ValueError:
            continue
    return analyses


def _labels_for(a: MatchAnalysis) -> List[str]:
    """Prefiks-labels: 1/X/2 for 3-vejs, 1/2 for 2-vejs markeder."""
    if len(a.outcomes) == 3:
        prefix = ["1", "X", "2"]
    else:
        prefix = ["1", "2"]
    return [f"{prefix[i]} {o.name}" for i, o in enumerate(a.outcomes)]


def _format_match(a: MatchAnalysis, min_edge: float) -> str:
    lines: List[str] = []
    header = f"{a.home_team}  vs  {a.away_team}"
    lines.append(header)
    lines.append("-" * len(header))
    if a.league:
        lines.append(f"Liga/turnering: {a.league}")
    if a.commence_time:
        lines.append(f"Kampstart: {a.commence_time}")
    lines.append(
        f"Bookmakere: {a.num_bookmakers}   "
        f"Gns. margin: {(a.avg_overround - 1) * 100:.1f}%"
    )
    lines.append("")

    # Kolonner: udfald, chance%, fair odds, bedste odds, hos, value.
    lines.append(
        f"  {'Udfald':<26}{'Chance':>8}{'Fair':>8}{'Bedste':>9}"
        f"  {'Bookmaker':<14}{'Value':>8}"
    )
    labels = _labels_for(a)
    for i, o in enumerate(a.outcomes):
        label = labels[i] if i < len(labels) else o.name
        value_str = f"{o.edge * 100:+.1f}%" if o.best_odds > 0 else "  -  "
        marker = "  <-- VALUE" if o.edge >= min_edge else ""
        lines.append(
            f"  {label:<26}{o.consensus_pct:>7.1f}%{o.fair_decimal_odds:>8.2f}"
            f"{o.best_odds:>9.2f}  {o.best_bookmaker:<14}{value_str:>8}{marker}"
        )

    value_bets = [o for o in a.outcomes if o.edge >= min_edge]
    if value_bets:
        lines.append("")
        for o in value_bets:
            lines.append(
                f"  * VALUE: {o.name} @ {o.best_odds:.2f} ({o.best_bookmaker}) "
                f"— konsensus {o.consensus_pct:.1f}%, "
                f"forventet værdi {o.edge * 100:+.1f}%"
            )
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="oddscalc",
        description="Beregn fodbold-sandsynligheder ud fra live odds.",
    )
    p.add_argument(
        "--league",
        help="Liga at hente live odds for (fx epl, superliga, laliga). "
        "Se --list-leagues.",
    )
    p.add_argument(
        "--demo",
        action="store_true",
        help="Kør med indbygget testdata (ingen API-nøgle nødvendig).",
    )
    p.add_argument(
        "--file",
        help="Analysér en gemt rå The Odds API-JSON-fil i stedet for at "
        "kalde API'et.",
    )
    p.add_argument(
        "--api-key",
        help="The Odds API-nøgle (ellers bruges miljøvariablen ODDS_API_KEY).",
    )
    p.add_argument(
        "--regions",
        default="eu,uk",
        help="Bookmaker-regioner, kommasepareret (default: eu,uk).",
    )
    p.add_argument(
        "--exclude-exchanges",
        action="store_true",
        help="Ignorér odds-børser (Betfair, Matchbook, Smarkets) når bedste "
        "odds/value findes — de har kunstigt lav margin og giver falske "
        "value-signaler.",
    )
    p.add_argument(
        "--min-edge",
        type=float,
        default=0.02,
        help="Minimum forventet værdi (0.02 = 2%%) før noget markeres som "
        "value bet (default: 0.02).",
    )
    p.add_argument(
        "--list-leagues",
        action="store_true",
        help="Vis understøttede ligaer og afslut.",
    )
    return p


def main(argv: Optional[List[str]] = None) -> int:
    args = build_parser().parse_args(argv)

    if args.list_leagues:
        print("Understøttede ligaer (--league <navn>):\n")
        for name, key in api.SPORTS.items():
            print(f"  {name:<12} {key}")
        return 0

    # Vælg datakilde: fil, demo eller live.
    if args.file:
        try:
            events = api.load_events_from_file(args.file)
        except (OSError, api.OddsAPIError, ValueError) as exc:
            print(f"Fejl ved indlæsning af fil: {exc}", file=sys.stderr)
            return 1
        source = f"FIL — {args.file}"
    elif args.demo or (not args.league):
        if not args.demo and not args.league:
            print(
                "Ingen --league angivet — kører i demo-mode. "
                "Brug --league <navn> for live odds, eller --demo for at "
                "skjule denne besked.\n"
            )
        events = demo_events()
        source = "DEMO-DATA"
    else:
        key = api.get_api_key(args.api_key)
        if not key:
            print(
                "Fejl: ingen API-nøgle fundet. Sæt ODDS_API_KEY eller brug "
                "--api-key, eller kør --demo.",
                file=sys.stderr,
            )
            return 2
        sport_key = api.SPORTS.get(args.league, args.league)
        try:
            raw = api.fetch_odds(sport_key, key, regions=args.regions)
        except api.OddsAPIError as exc:
            print(f"Fejl ved hentning af odds: {exc}", file=sys.stderr)
            return 1
        events = [api.normalise_event(ev) for ev in raw]
        source = f"LIVE — {sport_key}"

    analyses = _analyse_events(events, exclude_exchanges=args.exclude_exchanges)
    if not analyses:
        print("Ingen kampe med brugbare odds fundet.")
        return 0

    print(f"=== Fodbold-odds analyse ({source}) — {len(analyses)} kampe ===\n")
    for a in analyses:
        print(_format_match(a, args.min_edge))
        print()

    total_value = sum(len([o for o in a.outcomes if o.edge >= args.min_edge])
                      for a in analyses)
    print(f"Fundet {total_value} value bet(s) med min. edge "
          f"{args.min_edge * 100:.1f}%.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
