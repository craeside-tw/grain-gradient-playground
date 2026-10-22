import colorModern from '@tw-tokens/color-modern.tokens.json';
import colorShared from '@tw-tokens/color-shared.tokens.json';

export type PrimitiveColorOption = {
  path: string;
  label: string;
  hex: string;
};

/** EstateOS / modern Figma ramps only — no feedback, semantic, Tailwind, Figma-gray, or classic steps. */
const MODERN_ALLOWED_FAMILIES = new Set([
  'blue',
  'midnight',
  'eggplant',
  'pine',
  'papaya',
  'butter',
  'stone',
  'sand',
  'accent',
]);

const MODERN_EXCLUDED_FAMILIES = new Set([
  'success',
  'warning',
  'error',
  'focus-ring',
  'figma-gray',
  'cyan',
  'yellow',
  'purple',
  'orange',
  'turquoise',
  'navy',
  'action-blue',
  'table',
  'border-warm',
  'gray',
  'grey',
]);

const SHARED_ALLOWED_FAMILIES = new Set(['neutral']);

type DtcgColorLeaf = {
  $value?: string;
  $type?: string;
};

function isColorLeaf(node: unknown): node is DtcgColorLeaf {
  if (!node || typeof node !== 'object') return false;
  const leaf = node as DtcgColorLeaf;
  return leaf.$type === 'color' && typeof leaf.$value === 'string';
}

function pathSegmentBlocked(segment: string): boolean {
  return (
    segment.startsWith('darken-') ||
    segment.startsWith('lighten-') ||
    segment.includes('figma')
  );
}

function isAllowedPath(pathParts: string[]): boolean {
  if (pathParts.some(pathSegmentBlocked)) return false;
  if (pathParts[0] === 'neutral') {
    const step = pathParts[pathParts.length - 1];
    return step === 'black' || step === 'white';
  }
  return true;
}

function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.startsWith('#')) {
    return trimmed.length >= 7 ? trimmed.slice(0, 7).toUpperCase() : null;
  }
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = Number(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = Number(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }
  return null;
}

function walkColorTree(
  node: Record<string, unknown>,
  prefix: string[],
  out: PrimitiveColorOption[],
): void {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const pathParts = [...prefix, key];
    if (!isAllowedPath(pathParts)) continue;

    if (isColorLeaf(value)) {
      const hex = normalizeHex(value.$value!);
      if (!hex) continue;
      out.push({
        path: pathParts.join('.'),
        label: `color.${pathParts.join('.')}`,
        hex,
      });
      continue;
    }
    if (value && typeof value === 'object') {
      walkColorTree(value as Record<string, unknown>, pathParts, out);
    }
  }
}

function modernFamilyAllowed(family: string): boolean {
  if (MODERN_EXCLUDED_FAMILIES.has(family)) return false;
  if (pathSegmentBlocked(family)) return false;
  return MODERN_ALLOWED_FAMILIES.has(family);
}

function flattenModern(file: Record<string, unknown>): PrimitiveColorOption[] {
  const colorRoot = file.color as Record<string, unknown> | undefined;
  if (!colorRoot) return [];

  const out: PrimitiveColorOption[] = [];
  for (const [family, subtree] of Object.entries(colorRoot)) {
    if (family.startsWith('$')) continue;
    if (!modernFamilyAllowed(family)) continue;
    if (subtree && typeof subtree === 'object') {
      walkColorTree(subtree as Record<string, unknown>, [family], out);
    }
  }
  return out;
}

function flattenShared(file: Record<string, unknown>): PrimitiveColorOption[] {
  const colorRoot = file.color as Record<string, unknown> | undefined;
  if (!colorRoot) return [];

  const out: PrimitiveColorOption[] = [];
  for (const [family, subtree] of Object.entries(colorRoot)) {
    if (family.startsWith('$')) continue;
    if (!SHARED_ALLOWED_FAMILIES.has(family)) continue;
    if (subtree && typeof subtree === 'object') {
      walkColorTree(subtree as Record<string, unknown>, [family], out);
    }
  }
  return out;
}

function mergeOptions(lists: PrimitiveColorOption[][]): PrimitiveColorOption[] {
  const byLabel = new Map<string, PrimitiveColorOption>();
  for (const list of lists) {
    for (const option of list) {
      if (!byLabel.has(option.label)) {
        byLabel.set(option.label, option);
      }
    }
  }
  return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export const PRIMITIVE_COLOR_OPTIONS: PrimitiveColorOption[] = mergeOptions([
  flattenModern(colorModern as Record<string, unknown>),
  flattenShared(colorShared as Record<string, unknown>),
]);

export type ColorFamilyGroup = {
  family: string;
  shades: string[];
};

function compareShades(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  const aNum = !Number.isNaN(na) && String(na) === a;
  const bNum = !Number.isNaN(nb) && String(nb) === b;
  if (aNum && bNum) return na - nb;
  return a.localeCompare(b);
}

function buildColorFamilyGroups(): ColorFamilyGroup[] {
  const byFamily = new Map<string, Set<string>>();
  for (const option of PRIMITIVE_COLOR_OPTIONS) {
    const dot = option.path.indexOf('.');
    if (dot === -1) continue;
    const family = option.path.slice(0, dot);
    const shade = option.path.slice(dot + 1);
    let shades = byFamily.get(family);
    if (!shades) {
      shades = new Set();
      byFamily.set(family, shades);
    }
    shades.add(shade);
  }
  return [...byFamily.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([family, shadeSet]) => ({
      family,
      shades: [...shadeSet].sort(compareShades),
    }));
}

export const COLOR_FAMILY_GROUPS: ColorFamilyGroup[] = buildColorFamilyGroups();

export const COLOR_FAMILIES: string[] = COLOR_FAMILY_GROUPS.map((g) => g.family);

export function shadesForFamily(family: string): string[] {
  return (
    COLOR_FAMILY_GROUPS.find((g) => g.family === family)?.shades ?? []
  );
}

export function parseColorPath(path: string): { family: string; shade: string } {
  const dot = path.indexOf('.');
  if (dot === -1) {
    const fallback = COLOR_FAMILY_GROUPS[0];
    return {
      family: fallback?.family ?? 'neutral',
      shade: fallback?.shades[0] ?? 'black',
    };
  }
  const family = path.slice(0, dot);
  const shade = path.slice(dot + 1);
  const shades = shadesForFamily(family);
  if (shades.length === 0) {
    const fallback = COLOR_FAMILY_GROUPS[0];
    return {
      family: fallback?.family ?? family,
      shade: fallback?.shades[0] ?? shade,
    };
  }
  return {
    family,
    shade: shades.includes(shade) ? shade : shades[0]!,
  };
}

export function colorPathFromParts(family: string, shade: string): string {
  const shades = shadesForFamily(family);
  const resolvedShade = shades.includes(shade) ? shade : shades[0];
  if (!resolvedShade) return defaultColorPath();
  return `${family}.${resolvedShade}`;
}

export function findColorByPath(path: string): PrimitiveColorOption | undefined {
  return PRIMITIVE_COLOR_OPTIONS.find((o) => o.path === path);
}

export function defaultColorPath(preferred?: string): string {
  if (preferred && findColorByPath(preferred)) return preferred;
  return PRIMITIVE_COLOR_OPTIONS[0]?.path ?? 'neutral.black';
}

export function applyOpacity(hex: string, opacityPercent: number): string {
  const normalized = hex.replace('#', '').trim();
  let r: number;
  let g: number;
  let b: number;

  if (normalized.length === 3) {
    r = parseInt(normalized[0] + normalized[0], 16);
    g = parseInt(normalized[1] + normalized[1], 16);
    b = parseInt(normalized[2] + normalized[2], 16);
  } else if (normalized.length === 6) {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
  } else if (normalized.length === 8) {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
  } else {
    return hex;
  }

  const alpha = Math.round(Math.min(100, Math.max(0, opacityPercent)) * 2.55);
  const aa = alpha.toString(16).padStart(2, '0').toUpperCase();
  const rr = r.toString(16).padStart(2, '0').toUpperCase();
  const gg = g.toString(16).padStart(2, '0').toUpperCase();
  const bb = b.toString(16).padStart(2, '0').toUpperCase();
  return `#${rr}${gg}${bb}${aa}`;
}

export type TokenColorSlot = {
  path: string;
  opacity: number;
};

export function resolveTokenColor(slot: TokenColorSlot): string {
  const option = findColorByPath(slot.path);
  if (!option) return '#000000FF';
  return applyOpacity(option.hex, slot.opacity);
}
