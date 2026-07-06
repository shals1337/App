# Min Træning

En simpel, mørk trænings-app (PWA) på dansk: følg de maskiner og øvelser du
bruger, hvilken vægt du løfter, og hvor meget du går op — plus din egen vægt
og en kcal/protein-tæller. Ingen konto, ingen backend: alt gemmes på enheden
(`localStorage`).

## Funktioner

- **Øvelser** — tilføj de maskiner/øvelser du bruger (fx Leg Press, Ab Crunch,
  Dumbbell Curl) fra et bibliotek med ~60 øvelser fordelt på muskelgrupper,
  eller opret dine egne. Forsiden viser din seneste vægt pr. øvelse og hvor
  meget du er gået op (↑ 5 kg).
- **Log & fremgang** — tryk på en øvelse, tast vægt (og evt. reps), og følg
  din fremgang: nuværende/bedste vægt, samlet fremgang og en graf over tid.
- **Kost** — daglig kcal- og protein-tæller med valgfrie daglige mål
  (fremdriftsbjælker), hurtig indtastning af måltider og totaler for de
  seneste dage.
- **Min vægt** — log din kropsvægt og se udviklingen som graf.
- **Backup** — eksportér/importér alle data som JSON.
- **Ingen zoom** — appen opfører sig som en native app (ingen pinch/dobbelt-
  tryk-zoom, ingen auto-zoom ved inputfelter). Danske komma-decimaler ("82,5")
  understøttes.
- **PWA** — føj til hjemmeskærm, virker offline efter første load.

## Kør

```
npm install
npm run dev
```

Åbn den viste URL. På telefonen: åbn samme URL og vælg "Føj til hjemmeskærm"
(Safari) eller "Installér app" (Chrome).

## Byg

```
npm run build
npm run preview
```

## Projektstruktur

| Sti | Formål |
|-----|--------|
| `src/App.tsx` | Skal, bund-navigation (Øvelser / Kost / Min vægt). |
| `src/state/AppContext.tsx` | Al app-state + `localStorage`-persistens. |
| `src/types.ts` | Datamodeller (øvelser, logs, kost, kropsvægt, mål). |
| `src/data/exercises.ts` | Indbygget øvelsesbibliotek pr. muskelgruppe. |
| `src/storage.ts` | Lagring, backup og migrering fra ældre versioner. |
| `src/views/ExercisesHome.tsx` | Forsiden: dine øvelser med seneste vægt + delta. |
| `src/views/ExerciseDetail.tsx` | Log vægt, statistik, graf og historik. |
| `src/views/NutritionView.tsx` | Kcal/protein-tæller, mål og seneste dage. |
| `src/views/WeightView.tsx` | Kropsvægt: log, graf og historik. |
| `src/components/LineChart.tsx` | Interaktiv SVG-graf. |
| `vite.config.ts` | PWA-manifest/ikoner/service worker (`vite-plugin-pwa`). |

## Tilpasning

- **Tema:** design-tokens ligger i `src/index.css` (`--accent`, flader m.m.).
- **Øvelsesbibliotek:** `src/data/exercises.ts`.
- **App-navn/ikon:** manifestet i `vite.config.ts`, meta-tags i `index.html`
  og PNG'erne i `public/icons/`.
