# Grain gradient playground

Local alternative to [Paper Grain Gradient](https://shaders.paper.design/grain-gradient) for on-brand animated backgrounds. Uses `@paper-design/shaders-react` and **EstateOS modern Figma ramps** from Trust & Will design tokens (`color-modern` allowlist plus shared **`neutral.black`** / **`neutral.white`** and **`accent`** greige steps).

## Run locally

```bash
npm install
npm run dev
```

Optional: point at live tokens from a `tw-nx-web` checkout:

```bash
export TW_NX_WEB_ROOT=/path/to/tw-nx-web
npm run dev
```

Otherwise builds use `vendor/design-tokens/` snapshots.

## GitHub Pages (personal or org repo)

This folder is a **standalone repo root** (not tied to Company Brain).

1. Create an empty repo on GitHub (e.g. `grain-gradient-playground`).
2. Push this directory as `main`.
3. **Settings → Pages → Build and deployment → Source:** **GitHub Actions**.
4. After the workflow runs, open:

   `https://<your-username>.github.io/<repo-name>/`

   Example: `https://craeside-tw.github.io/grain-gradient-playground/`

Workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

## Refresh vendored tokens

When EstateOS ramps change in `tw-nx-web`:

```bash
cp /path/to/tw-nx-web/packages/config/design-tokens/tokens/primitive/color-modern.tokens.json \
   /path/to/tw-nx-web/packages/config/design-tokens/tokens/primitive/color-shared.tokens.json \
   vendor/design-tokens/primitive/
```

Commit and push to redeploy.

## Build

```bash
npm run build
npm run preview
```
