import type { TokenColorSlot } from './primitive-colors';

export type GrainShape =
  | 'wave'
  | 'dots'
  | 'truchet'
  | 'corners'
  | 'ripple'
  | 'blob';

export type PlaygroundState = {
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
};

export const DEFAULT_PLAYGROUND_STATE: PlaygroundState = {
  colorSlots: [
    { path: 'papaya.40', opacity: 100 },
    { path: 'pine.40', opacity: 100 },
    { path: 'blue.40', opacity: 100 },
    { path: 'midnight.30', opacity: 100 },
  ],
  colorBack: { path: 'neutral.black', opacity: 100 },
  softness: 0.5,
  intensity: 0.5,
  noise: 0.25,
  shape: 'corners',
  speed: 1,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  width: '1280',
  height: '720',
};

export function parseDimensionInput(raw: string): number | string {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}
