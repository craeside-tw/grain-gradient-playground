import type { PlaygroundState, GrainShape } from './defaults';
import {
  PRIMITIVE_COLOR_OPTIONS,
  defaultColorPath,
  type TokenColorSlot,
} from './primitive-colors';

const SHAPES: GrainShape[] = [
  'wave',
  'dots',
  'truchet',
  'corners',
  'ripple',
  'blob',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const value = min + Math.random() * (max - min);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function pickRandomPath(): string {
  const index = randomInt(0, PRIMITIVE_COLOR_OPTIONS.length - 1);
  return PRIMITIVE_COLOR_OPTIONS[index]?.path ?? defaultColorPath();
}

function randomSlot(): TokenColorSlot {
  return {
    path: pickRandomPath(),
    opacity: randomInt(35, 100),
  };
}

export function randomizePlaygroundState(
  current: PlaygroundState,
): PlaygroundState {
  const colorCount = randomInt(2, 5);
  const colorSlots = Array.from({ length: colorCount }, () => randomSlot());

  return {
    ...current,
    shape: SHAPES[randomInt(0, SHAPES.length - 1)] ?? 'corners',
    colorSlots,
    colorBack: randomSlot(),
    softness: randomFloat(0.2, 0.9),
    intensity: randomFloat(0.2, 0.85),
    noise: randomFloat(0.1, 0.65),
    scale: randomFloat(0.75, 1.35),
    rotation: randomInt(0, 360),
    offsetX: randomFloat(-0.45, 0.45),
    offsetY: randomFloat(-0.45, 0.45),
  };
}
