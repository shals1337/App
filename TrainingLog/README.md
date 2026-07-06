# Training Log

A workout logging web app: log exercises, sets, reps and weight, browse
your history, and track progress per exercise over time. Installable as a
PWA so it can be added to your phone's home screen and used like a native
app (works offline after the first load).

## Features

- **Log workouts** — pick exercises from your library and add sets (reps +
  weight) for today's session.
- **History** — browse past workouts, expand a day to see every set logged,
  delete a session if needed.
- **Progress** — pick an exercise and see your best set and total volume
  per session as a simple bar chart and table.
- **Exercises** — add, rename, and remove the exercises in your library.
  Ships with a few common lifts as starters.
- **Persistent** — everything is saved in the browser (`localStorage`), no
  account or backend required.
- **Installable** — has a web app manifest, icons, and a service worker, so
  browsers offer "Add to Home Screen" and it opens full-screen like a
  native app.

## Run

```
npm install
npm run dev
```

Then open the printed local URL. On a phone, open the same URL in the
browser and use "Add to Home Screen" (Safari) or "Install app" (Chrome).

## Build

```
npm run build
npm run preview
```

## Project layout

| File | Purpose |
|------|---------|
| `src/App.tsx` | Tab navigation and top-level state (exercises, sessions). |
| `src/storage.ts` | `localStorage` persistence and starter exercise data. |
| `src/types.ts` | `Exercise`, `SetEntry`, `LoggedExercise`, `WorkoutSession` models. |
| `src/components/LogWorkoutView.tsx` | Build and save today's workout. |
| `src/components/HistoryView.tsx` | Browse and delete past sessions. |
| `src/components/ProgressView.tsx` | Per-exercise progression chart. |
| `src/components/ExercisesView.tsx` | Manage the exercise library. |
| `vite.config.ts` | PWA manifest/icons/service-worker config (`vite-plugin-pwa`). |
| `public/icons/icon-source.svg` | Source icon; regenerate PNGs from it if you change branding. |

## Customizing

- **Starter exercises:** edit `STARTER_EXERCISES` in `src/storage.ts`.
- **Colors/theme:** edit the CSS variables in `src/index.css` (light and
  dark variants) and `theme_color`/`background_color` in `vite.config.ts`.
- **App name/icon:** update the `manifest` block in `vite.config.ts`, the
  `<title>`/meta tags in `index.html`, and regenerate the PNGs in
  `public/icons/` from `icon-source.svg`.
