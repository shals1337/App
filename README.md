# Mia's Website

A personal website built with **React** and **Vite**. Kept as a private repo —
no public deployment.

## Getting started

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the local dev server (http://localhost:5173)
```

Then open the URL it prints in your browser. The page reloads automatically as
you edit files.

## Other commands

```bash
npm run build    # build an optimized production bundle into /dist
npm run preview  # preview the production build locally
```

## How to customize

Almost everything you'll want to change lives in **`src/content.js`** — your
name, intro text, "things I love" cards, gallery captions, and contact links.
Edit that file and the site updates instantly.

- **Photos:** drop image files into the `public/` folder, then reference them
  in `src/content.js` gallery items, e.g.
  `{ src: '/my-photo.jpg', caption: 'A nice day' }`.
- **Colors / styling:** tweak the variables at the top of `src/index.css`
  (`--pink`, `--purple`, etc.).

## Project structure

```
public/            Static files (favicon, images)
src/
  components/      React components for each section of the page
  content.js       ← edit this to personalize the site
  App.jsx          Page layout
  index.css        Styles
  main.jsx         App entry point
index.html         HTML shell
```

## Keeping it private

This is just the code. To keep it private, store it in a **private** GitHub
repository. You can run it locally with `npm run dev` any time. If you ever want
to publish it (e.g. GitHub Pages, Netlify, or Vercel), let me know and I can set
that up.
