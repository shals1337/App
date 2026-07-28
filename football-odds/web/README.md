# OddsCalc web-app

Selvstændig web-app bygget fra live The Odds API-data.

- `template.html` — kildekode (HTML/CSS/JS med pladsholdere)
- `build.py` — bygger `index.html` fra rå API-data (odds + scores)
- `index.html` — færdig, selvstændig app (data indlejret)
- `history.json` / `tips.json` — akkumuleres over tid (odds-historik + facit)
- `keygen.py` — generér licensnøgler

## Byg

```bash
python web/build.py all_soccer.json --scores all_scores.json
```

Builderen skriver både `index.html` (data indlejret) og `data.json` (data
alene). Den hostede side henter `data.json` hvert minut og opdaterer sig selv.

## Gratis "live"-opdatering (uden at betale)

Ingen betalt server nødvendig:

1. **Host gratis på GitHub Pages** — peg Pages på `football-odds/web/`.
2. **Auto-opdatering med GitHub Actions** — workflowen
   `.github/workflows/oddscalc-update.yml` kører builderen på en tidsplan,
   henter friske odds og committer `data.json`. Tilføj din nøgle som
   repo-secret `ODDS_API_KEY` (Settings → Secrets → Actions).
3. **Appen auto-refresher** — den henter `data.json` hvert minut og viser
   "Opdateret HH:MM" med en grøn prik i headeren.

Juster `cron` i workflowen efter din gratis API-kvote (færre ligaer / sjældnere
= billigere). Ægte sekund-live kræver en betalt datakilde eller Betfair
Exchange-API'et (gratis nøgle, men kun børs-odds).

## Licens / betaling — læs dette

Appen har en **licens-gate** (`REQUIRE_LICENSE = true` i `template.html`).
Sæt den til `false` for en åben demo.

### Vigtigt: dette er "soft" licensering

Nøglerne valideres i **browserens JavaScript**. Det betyder:

- En teknisk bruger kan **omgå** gaten (se kildekode, slette gaten, eller
  udlede algoritmen og lave egne nøgler).
- Det **opkræver ikke** betaling i sig selv — det låser bare UI'et.

Det er fint til at holde tilfældige brugere ude og få folk til at købe, men
det er **ikke ægte kopibeskyttelse**.

### Sådan tager du imod rigtige penge

1. **Sælg via en betalingsudbyder** der håndterer kort/betaling og udsteder
   nøgler automatisk:
   - **Gumroad** eller **Lemon Squeezy** har indbygget "license keys" —
     de tager betalingen og genererer/verificerer nøgler via deres API.
   - **Stripe Payment Links** til selve betalingen.
2. Sæt `BUY_URL` i `template.html` til din salgs-side.
3. Generér nøgler til manuelt salg med:
   ```bash
   python web/keygen.py 20        # 20 gyldige nøgler
   python web/keygen.py 1 --check XXXXX-XXXXX-XXXXX-XXXXX
   ```

### Ægte beskyttelse (kræver backend)

Til rigtig sikkerhed skal nøgler valideres **på en server**:

- En lille backend (fx en serverless-funktion) tjekker nøglen mod en
  database og returnerer OK/afvist.
- Betalingsudbyderens webhook opretter nøglen i databasen ved køb.
- Appen kalder backend'en ved aktivering i stedet for at validere lokalt.

Med Gumroad/Lemon Squeezy kan du kalde deres *license verify*-API direkte
(kræver at appen hostes på et rigtigt domæne pga. browserens CSP — virker
ikke i Claude-artifact-visningen).
