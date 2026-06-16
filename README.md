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

## Deploying to Netlify (private link for your phone)

This repo is Netlify-ready — the build settings live in `netlify.toml`, so you
don't have to type anything in. Pick whichever route is easier:

### Easiest: drag-and-drop (no account connection needed)

1. On your computer, run `npm install` then `npm run build` to create the
   `dist/` folder.
2. Go to <https://app.netlify.com/drop> and drag the `dist` folder onto the
   page.
3. Netlify gives you a live URL instantly — open it in Safari on your iPhone.

> Note: drag-and-drop is a one-time upload. When you change the site, build
> again and re-drop. For automatic updates, use the connected-repo route below.

### Recommended: connect the repo (auto-deploys on every push)

1. Push this repo to **GitHub** (keep it private if you like).
2. Sign in at <https://app.netlify.com> → **Add new site** → **Import an
   existing project** → choose GitHub and pick this repo.
3. Netlify reads `netlify.toml`, so just click **Deploy**. Build command
   (`npm run build`) and publish folder (`dist`) are already filled in.
4. You get a URL like `https://your-site.netlify.app`. Every push to the branch
   redeploys automatically.

### Make the link private (password protection)

Netlify's built-in **password protection / SSO** is part of their paid plans.
Free ways to keep it semi-private:

- **Obscure URL:** the random `*.netlify.app` name is hard to guess. Fine for
  casual sharing.
- **Basic Auth:** add a `_headers` file or use a Netlify Edge Function to
  require a password. Tell me and I'll add it.

## Keeping it private

This is just the code. To keep it private, store it in a **private** GitHub
repository. You can run it locally with `npm run dev` any time.
