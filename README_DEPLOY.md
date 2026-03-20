Deployment guide — GitHub Pages (frontend) + Render (backend)
============================================================

This repo is now configured so the frontend can be deployed as a static export to GitHub Pages while the backend runs on Render.

Architecture
------------
- Frontend host: GitHub Pages (`https://<user>.github.io/<repo>`)
- Backend host: Render Web Service (Express + Prisma)
- CI/CD: GitHub Actions workflow in `.github/workflows/deploy.yml`

What is configured
------------------
1. `frontend/next.config.js`
- Uses static export when `GITHUB_PAGES=true`
- Sets `basePath` and `assetPrefix` from `GITHUB_REPOSITORY`
- Enables `trailingSlash` for Pages compatibility
- Uses unoptimized images for static hosting

2. SPA deep-link fallback
- `frontend/scripts/write-gh-pages-404.mjs` generates:
  - `frontend/out/404.html` with redirect shim for deep links
  - `frontend/out/.nojekyll`
- `frontend/app/layout.tsx` has route-recovery script that restores path from `?p=...`

3. GitHub Actions deploy workflow
- `.github/workflows/deploy.yml`
- Builds frontend export and deploys to GitHub Pages on push to `main`

4. Frontend script
- `npm --workspace frontend run build:github-pages`
- Builds static output and generates fallback files

Required repository secrets
---------------------------
Set these in GitHub repo Settings -> Secrets and variables -> Actions:

- `NEXT_PUBLIC_API_URL`
  - Example: `https://greenlight-backend-lax5.onrender.com`
- `NEXT_PUBLIC_PRIVY_APP_ID`
  - Privy app id for production auth

If `NEXT_PUBLIC_API_URL` is not set, workflow falls back to Render URL in the workflow default.

One-time GitHub Pages setup
---------------------------
1. Open repository Settings -> Pages.
2. Source: GitHub Actions.
3. Save.

After that, every push to `main` redeploys Pages automatically.

Manual local verification
-------------------------
From repo root:

```bash
npm ci
GITHUB_PAGES=true GITHUB_REPOSITORY=<owner>/<repo> NEXT_PUBLIC_API_URL=https://greenlight-backend-lax5.onrender.com NEXT_PUBLIC_USE_MOCK_DATA=false npm --workspace frontend run build:github-pages
npx serve frontend/out
```

Open:
- Home: `http://localhost:3000/<repo>/`
- Deep-link test: `http://localhost:3000/<repo>/project/demo-water-sensors/`

Operational notes
-----------------
- Backend CORS must allow your Pages origin.
- Privy dashboard must include your Pages origin as an allowed origin.
- Dynamic client routes are supported through the generated 404 fallback and route recovery script.

Future deploy flow
------------------
1. Commit to `main`.
2. GitHub Actions builds and deploys to Pages.
3. Check Actions tab for deploy status.
4. Verify the site URL in Pages settings.
