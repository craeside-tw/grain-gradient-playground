import type { GrainShape, PlaygroundState } from './defaults';
import { DEFAULT_PLAYGROUND_STATE } from './defaults';
import { findColorByPath, type TokenColorSlot } from './primitive-colors';

export const GRAIN_RECIPE_VERSION = '1' as const;

export type GrainRecipeV1 = {
  grainRecipe: typeof GRAIN_RECIPE_VERSION;
  name: string;
  colorSlots: TokenColorSlot[];
  colorBack: TokenColorSlot;
  softness: number;
  intensity: number;
  noise: number;
  shape: GrainShape;
  speed: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  width: string;
  height: string;
  paused: boolean;
  frameMs: number;
};

export type RecipeExportContext = {
  name: string;
  paused: boolean;
  frameMs: number;
};

export type RecipeImportResult = {
  name: string;
  state: PlaygroundState;
  paused: boolean;
  frameMs: number;
  warnings: string[];
};

const SHAPES: GrainShape[] = [
  'wave',
  'dots',
  'truchet',
  'corners',
  'ripple',
  'blob',
];

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function slugFromRecipeName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return slug || `grain-${Math.floor(Date.now() / 1000)}`;
}

export function defaultExportSlug(): string {
  return `grain-${Math.floor(Date.now() / 1000)}`;
}

export function stateToRecipe(
  state: PlaygroundState,
  context: RecipeExportContext,
): GrainRecipeV1 {
  return {
    grainRecipe: GRAIN_RECIPE_VERSION,
    name: context.name,
    colorSlots: state.colorSlots.map((slot) => ({ ...slot })),
    colorBack: { ...state.colorBack },
    softness: state.softness,
    intensity: state.intensity,
    noise: state.noise,
    shape: state.shape,
    speed: state.speed,
    scale: state.scale,
    rotation: state.rotation,
    offsetX: state.offsetX,
    offsetY: state.offsetY,
    width: state.width,
    height: state.height,
    paused: context.paused,
    frameMs: Math.max(0, context.frameMs),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** JSON may use boolean true or legacy string "true". */
export function parseRecipePaused(value: unknown): boolean {
  if (value === true) return true;
  if (value === false || value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return false;
}

function parseColorSlot(raw: unknown, warnings: string[], label: string): TokenColorSlot {
  const fallback = DEFAULT_PLAYGROUND_STATE.colorBack;
  if (!isRecord(raw)) {
    warnings.push(`${label}: invalid color slot; using default.`);
    return { ...fallback };
  }
  const path = typeof raw.path === 'string' ? raw.path : fallback.path;
  const opacityRaw = typeof raw.opacity === 'number' ? raw.opacity : 100;
  const opacity = clamp(Math.round(opacityRaw), 0, 100);
  if (!findColorByPath(path)) {
    warnings.push(`${label}: unknown token path "${path}".`);
  }
  return { path, opacity };
}

export function recipeToEditorState(raw: unknown): RecipeImportResult {
  const warnings: string[] = [];

  if (!isRecord(raw)) {
    throw new Error('Recipe must be a JSON object.');
  }

  if (raw.grainRecipe !== GRAIN_RECIPE_VERSION) {
    throw new Error(
      `Unsupported grainRecipe version (expected "${GRAIN_RECIPE_VERSION}").`,
    );
  }

  const colorSlotsRaw = Array.isArray(raw.colorSlots) ? raw.colorSlots : [];
  if (colorSlotsRaw.length === 0) {
    warnings.push('No color slots; using one default slot.');
  }
  const colorSlots = (
    colorSlotsRaw.length > 0 ? colorSlotsRaw.slice(0, 7) : [{ path: 'papaya.40', opacity: 100 }]
  ).map((slot, i) => parseColorSlot(slot, warnings, `colorSlots[${i}]`));

  const colorBack = parseColorSlot(raw.colorBack, warnings, 'colorBack');

  const shapeRaw = typeof raw.shape === 'string' ? raw.shape : DEFAULT_PLAYGROUND_STATE.shape;
  const shape = SHAPES.includes(shapeRaw as GrainShape)
    ? (shapeRaw as GrainShape)
    : DEFAULT_PLAYGROUND_STATE.shape;
  if (shape !== shapeRaw) {
    warnings.push(`Unknown shape "${String(raw.shape)}"; using "${shape}".`);
  }

  const num = (key: string, fallback: number, min: number, max: number) => {
    const v = raw[key];
    if (typeof v !== 'number' || Number.isNaN(v)) return fallback;
    return clamp(v, min, max);
  };

  const frameMsRaw = raw.frameMs;
  let frameMs = 0;
  if (typeof frameMsRaw === 'number' && !Number.isNaN(frameMsRaw)) {
    frameMs = Math.max(0, frameMsRaw);
  } else {
    warnings.push('Missing frameMs; preview may not match an exported PNG.');
  }

  const pausedFlagInFile =
    raw.paused === undefined || raw.paused === null
      ? true
      : parseRecipePaused(raw.paused);

  /**
   * Paired `.png` + `.grainrecipe.json` exports are a still frame at `frameMs`.
   * Import always freezes playback so the live preview can match the PNG.
   * (Legacy saves often wrote paused:false when the Pause pill still showed "Pause".)
   */
  const paused = true;
  if (pausedFlagInFile === false) {
    warnings.push(
      'Recipe had paused:false; preview still loads paused at frameMs for PNG comparison.',
    );
  }

  const state: PlaygroundState = {
    colorSlots,
    colorBack,
    softness: num('softness', DEFAULT_PLAYGROUND_STATE.softness, 0, 1),
    intensity: num('intensity', DEFAULT_PLAYGROUND_STATE.intensity, 0, 1),
    noise: num('noise', DEFAULT_PLAYGROUND_STATE.noise, 0, 1),
    shape,
    speed: num('speed', DEFAULT_PLAYGROUND_STATE.speed, 0, 2),
    scale: num('scale', DEFAULT_PLAYGROUND_STATE.scale, 0.01, 4),
    rotation: num('rotation', DEFAULT_PLAYGROUND_STATE.rotation, 0, 360),
    offsetX: num('offsetX', DEFAULT_PLAYGROUND_STATE.offsetX, -1, 1),
    offsetY: num('offsetY', DEFAULT_PLAYGROUND_STATE.offsetY, -1, 1),
    width:
      typeof raw.width === 'string' ? raw.width : DEFAULT_PLAYGROUND_STATE.width,
    height:
      typeof raw.height === 'string' ? raw.height : DEFAULT_PLAYGROUND_STATE.height,
  };

  const name =
    typeof raw.name === 'string' && raw.name.trim()
      ? raw.name.trim()
      : defaultExportSlug();

  return { name, state, paused, frameMs, warnings };
}

export function parseRecipeFile(text: string): RecipeImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON.');
  }
  return recipeToEditorState(parsed);
}

export function recipeFilename(slug: string): string {
  return `${slug}.grainrecipe.json`;
}

export function pngFilename(slug: string): string {
  return `${slug}.png`;
}

export function downloadRecipeJson(recipe: GrainRecipeV1, slug: string): void {
  const body = `${JSON.stringify(recipe, null, 2)}\n`;
  const blob = new Blob([body], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = recipeFilename(slug);
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
