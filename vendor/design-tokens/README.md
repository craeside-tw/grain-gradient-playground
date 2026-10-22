# Vendored design token snapshots

Copies of `tw-nx-web` primitive color JSON for **GitHub Pages CI** (no sibling checkout required).

Refresh when EstateOS ramps change:

```bash
cp ../../../tw-nx-web/packages/config/design-tokens/tokens/primitive/color-modern.tokens.json \
  ../../../tw-nx-web/packages/config/design-tokens/tokens/primitive/color-shared.tokens.json \
  vendor/design-tokens/primitive/
```

Local dev still prefers live `tw-nx-web` when present (`vite.config.ts`).
