# ⚽ oddscalc — fodbold-odds & sandsynlighedsberegner

En lille Python-app der henter **live fodbold-odds**, regner **sandsynligheder**
ud af rigtige bookmaker-data, og finder **value bets** (spil med positiv
forventet værdi).

## Hvad den gør

1. **Henter live odds** fra [The Odds API](https://the-odds-api.com) for en
   valgt liga (Premier League, La Liga, Superligaen, Champions League m.fl.).
2. **Regner implicitte sandsynligheder** ud af odds: `sandsynlighed = 1 / odds`.
3. **Fjerner bookmakerens margin** (vig/overround) ved at normalisere, så
   sandsynlighederne summer til 100%.
4. **Laver konsensus** ved at tage gennemsnittet af de margin-rensede
   sandsynligheder på tværs af *alle* bookmakere → bedste bud på den *sande*
   chance for hjemmesejr / uafgjort / udesejr.
5. **Finder value bets**: hvor en bookmaker tilbyder odds der er bedre end den
   fair konsensus-odds (`forventet værdi = chance × odds − 1 > 0`).

## Hvorfor "konsensus" er smart

En enkelt bookmakers odds er farvet af deres margin og deres egen holdning.
Ved at rense margin ud og tage gennemsnittet på tværs af mange bookmakere får
man et robust, markedsbaseret estimat af de sande sandsynligheder. Tilbyder en
enkelt bookmaker så bedre odds end det, har man matematisk fordel.

## Kom i gang

Ingen runtime-afhængigheder — kun Pythons standardbibliotek.

```bash
cd football-odds

# Prøv med det samme (indbygget testdata, ingen nøgle nødvendig)
python -m oddscalc --demo
```

### Live odds

1. Opret en gratis konto på <https://the-odds-api.com> og hent din API-nøgle
   (gratis tier: ~500 requests/måned).
2. Sæt nøglen:
   ```bash
   export ODDS_API_KEY="din_noegle_her"
   ```
3. Kør for en liga:
   ```bash
   python -m oddscalc --league epl          # Premier League
   python -m oddscalc --league superliga    # Dansk Superliga
   python -m oddscalc --list-leagues        # vis alle understøttede ligaer
   ```

### Nyttige flag

| Flag | Betydning |
|------|-----------|
| `--demo` | Kør på indbygget testdata uden API-nøgle |
| `--league <navn>` | Hent live odds for en liga |
| `--file <sti>` | Analysér en gemt rå The Odds API-JSON-fil |
| `--regions eu,uk` | Hvilke bookmaker-regioner der medtages |
| `--exclude-exchanges` | Ignorér børser (Betfair/Matchbook) i value-jagten |
| `--min-edge 0.03` | Kun markér value bets med ≥ 3% forventet værdi |
| `--api-key <nøgle>` | Angiv nøgle direkte i stedet for miljøvariabel |

### Analysér en gemt API-fil

Har du allerede et svar fra The Odds API liggende (fx `examples/the_odds_api_sample.json`),
kan du køre analysen direkte på det — også for tennis/cricket (2-vejs markeder):

```bash
python -m oddscalc --file examples/the_odds_api_sample.json --exclude-exchanges
```

### Børser (exchanges)

Odds-børser som Betfair og Matchbook har meget lav margin, så deres priser ligger
næsten altid lidt over konsensus og giver derfor *falske* value-signaler. Brug
`--exclude-exchanges` for kun at jagte ægte fejlprissætning hos almindelige
bookmakere. Børserne tæller stadig med i konsensus-sandsynligheden (de er skarpe).

## Eksempel-output

```
Manchester City  vs  Arsenal
----------------------------
Bookmakere: 4   Gns. margin: 4.9%

  Udfald                  Chance    Fair   Bedste  Bookmaker        Value
  1 (Hjemme)               50.4%    1.98     2.02  Pinnacle         +1.8%
  X (Uafgjort)             25.3%    3.96     3.90  William Hill     -1.2%
  2 (Ude)                  24.3%    4.12     4.00  William Hill     -1.6%
```

## Projektstruktur

| Fil | Formål |
|-----|--------|
| `oddscalc/odds.py` | Odds-matematik: konvertering + fjernelse af margin |
| `oddscalc/probs.py` | Konsensus-sandsynligheder + value-bet analyse |
| `oddscalc/api.py` | Klient til The Odds API (live data) |
| `oddscalc/demo.py` | Indbygget testdata |
| `oddscalc/cli.py` | Kommandolinje-app |
| `tests/` | Enhedstests (pytest) |

## Test

```bash
pip install pytest
python -m pytest
```

## Ansvarsfraskrivelse

Værktøjet er til uddannelses- og analyseformål. Odds og sandsynligheder er
estimater; ingen model garanterer gevinst. Spil ansvarligt.
