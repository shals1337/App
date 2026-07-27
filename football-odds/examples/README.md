# Eksempel-data

`the_odds_api_sample.json` er et rigtigt svar fra The Odds API (`/v4/sports/upcoming/odds`
med `oddsFormat=decimal`). Det indeholder blandede sportsgrene (fodbold, tennis, cricket).

Kør analysen på det:

    python -m oddscalc --file examples/the_odds_api_sample.json
