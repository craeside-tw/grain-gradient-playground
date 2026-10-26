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

## Save and reload a gradient (recipe + PNG)

The playground cannot reconstruct shader settings from a PNG alone. Use a **paired export**:

| File | Purpose |
|------|---------|
| `{name}.png` | Visual snapshot at export time |
| `{name}.grainrecipe.json` | Token paths, shader props, **pause**, and **frameMs** |

1. **Save** (under the preview) downloads `{slug}.png` and `{slug}.grainrecipe.json` with the same auto-generated slug (`grain-<timestamp>`).
2. **Starting point** in the control panel: **Load recipe** or **Paste JSON** restores the editor.
3. Compare the live preview to the paired PNG on disk (same basename as the recipe file).

The recipe stores `frameMs` (Paper shader time in ms) and always writes **`paused: true`** on Save, because the paired PNG is a still. **Import always freezes** the preview at `frameMs` so you can compare to that PNG; use **Play** in the preview strip to animate again. Older recipes that saved `"paused": false` while the Pause pill still showed **Pause** are treated as paused on load (with a warning in the toast). The code panel still exports resolved hex for Paper; recipes are for playground round-trip only.

Example recipe fields:

```json
{
  "grainRecipe": "1",
  "name": "home-hero",
  "paused": true,
  "frameMs": 8420
}
```

(Full schema includes all control values and `colorSlots` with `path` + `opacity`.)

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
