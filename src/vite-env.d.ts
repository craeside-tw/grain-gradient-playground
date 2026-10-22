/// <reference types="vite/client" />

declare module '@tw-tokens/*.json' {
  const value: Record<string, unknown>;
  export default value;
}
