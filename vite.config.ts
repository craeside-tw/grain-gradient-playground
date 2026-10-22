import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const vendorTokensDir = join(__dirname, 'vendor/design-tokens/primitive');

const liveTokenCandidates = [
  process.env.TW_NX_WEB_ROOT,
  resolve(__dirname, '../tw-nx-web'),
  resolve(__dirname, '../../../tw-nx-web'),
]
  .filter(Boolean)
  .map((root) =>
    join(
      resolve(root as string),
      'packages/config/design-tokens/tokens/primitive',
    ),
  );

const tokensDir =
  liveTokenCandidates.find((dir) =>
    existsSync(join(dir, 'color-modern.tokens.json')),
  ) ?? vendorTokensDir;

if (!existsSync(join(tokensDir, 'color-modern.tokens.json'))) {
  console.warn(
    `[grain-gradient-playground] Token files not found. Expected tw-nx-web or ${vendorTokensDir}.`,
  );
}

function pagesBasePath(): string {
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (repo) {
    return `/${repo}/`;
  }
  return '/';
}

export default defineConfig({
  base: pagesBasePath(),
  plugins: [react()],
  resolve: {
    alias: {
      '@tw-tokens': tokensDir,
    },
  },
  server: {
    fs: {
      allow: [dirname(tokensDir), __dirname],
    },
  },
});
