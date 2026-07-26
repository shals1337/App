# Poker & Blackjack Helper

En selvstændig web-app til at **træne** poker og blackjack. Alt kører lokalt i
din browser — ingen installation, ingen server, ingen netværk. Åbn
`index.html` i Chrome, Edge, Safari eller Firefox på en hvilken som helst
computer.

## Faner

- **Poker odds** — Vælg dine hole cards og evt. fælleskort, sæt antal
  modstandere, og få din vinder-/split-/tabschance via Monte Carlo-simulering
  (12.000 kørsler). Lær pot odds og equity.
- **Blackjack strategi** — Fuldt basic-strategy-kort (4–8 decks, dealer står på
  soft 17, double efter split) plus en træner der driller dig i hit / stand /
  double / split.
- **Kort-tælling** — Hi-Lo tælle-træner. Vælg 1–8 decks og hastighed; kort
  flashes, og du holder tællingen i hovedet. Appen tjekker din running count og
  viser true count.
- **Hånd-guide** — Poker hånd-rangering og starthånd-tips.

## Sådan bruger du den

Dobbeltklik på `index.html`, eller træk filen ind i din browser.

## Om korttælling

Hi-Lo: 2–6 = +1, 7–9 = 0, 10–Es = −1. True count = running count delt med
antal decks tilbage i skoen. Tælling er kun meningsfuld når skoen deles ned til
et cut-kort (fysisk blackjack eller for-sjov-spil med en rigtig sko). Online
RNG-blackjack blander hver hånd, så tællingen nulstilles konstant og virker
ikke der.

## Hvad appen bevidst *ikke* gør

Den læser ikke skærmen fra en pokerklient og giver ikke råd i realtid mens du
spiller mod andre — det ville være at snyde de andre spillere. Værktøjerne her
er til at gøre *dig* til en bedre spiller gennem træning.
