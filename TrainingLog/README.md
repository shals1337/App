# Training Log

A clean, dark-themed workout tracking web app with the feature set of a paid
training app — templates, live workout logging with rest timer, PR detection,
progress charts, and body-weight tracking. Installable as a PWA so it lives on
your phone's home screen and works offline after the first load. No account,
no backend: everything is stored on-device (`localStorage`).

## Features

- **Dashboard** — workouts, volume, and week streak at a glance, recent PRs,
  quick access to your latest sessions, JSON data export.
- **Workout templates** — ships with Push/Pull/Legs starters; create, edit,
  and delete your own routines with target set counts.
- **Live workout logging** — session timer, per-set weight/reps entry,
  *previous session* values shown inline (tap ✓ on an empty row to repeat
  last time's set), add/remove sets and exercises mid-workout.
- **Rest timer** — starts automatically when you complete a set, with
  ±15s adjustment, skip, and a beep when time is up.
- **PR detection** — best-weight and estimated-1RM records are detected on
  finish and celebrated in the workout summary, on the dashboard, and as
  badges in history.
- **In-progress persistence** — an active workout survives closing or
  reloading the app; a resume pill brings you back into it.
- **History** — sessions grouped by month with volume/sets/duration, full
  set-by-set detail views, delete with confirmation.
- **Progress charts** — per-exercise est. 1RM, best set, and volume over
  time as interactive SVG line charts (touch/hover crosshair).
- **Body weight tracking** — daily log with its own trend chart.
- **Exercise library** — ~50 built-in exercises organised by muscle group,
  search and filter, per-exercise records and recent-session breakdown, plus
  custom exercises.

## Run

```
npm install
npm run dev
```

Open the printed URL. On a phone, open the same URL and use
"Add to Home Screen" (Safari) or "Install app" (Chrome).

## Build

```
npm run build
npm run preview
```

## Project layout

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Shell, bottom tab navigation, active-workout routing. |
| `src/state/AppContext.tsx` | All app state + `localStorage` persistence. |
| `src/types.ts` | Data models (sessions, sets, templates, body weight…). |
| `src/data/exercises.ts` | Built-in exercise library and starter templates. |
| `src/lib/stats.ts` | Est. 1RM (Epley), volume, PRs, records, streaks. |
| `src/views/HomeView.tsx` | Dashboard: stats, PRs, recent workouts, export. |
| `src/views/StartWorkoutView.tsx` | Template list + template editor. |
| `src/views/ActiveWorkoutView.tsx` | Live logging, rest timer, summary. |
| `src/views/HistoryView.tsx` | Month-grouped history + session detail. |
| `src/views/ProgressView.tsx` | Exercise charts + body-weight tracking. |
| `src/views/ExercisesView.tsx` | Library, search/filter, exercise detail. |
| `src/components/LineChart.tsx` | Interactive SVG line chart. |
| `vite.config.ts` | PWA manifest/icons/service-worker (`vite-plugin-pwa`). |

## Customizing

- **Theme:** design tokens live in `src/index.css` (`--accent`, surfaces, …).
- **Exercise library / starter templates:** `src/data/exercises.ts`.
- **App name/icon:** `vite.config.ts` manifest, `index.html` meta tags, and
  the PNGs in `public/icons/` (regenerate from `icon-source.svg`).
