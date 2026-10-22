import type { PlaygroundState } from './defaults';
import { parseDimensionInput } from './defaults';
import { findColorByPath, resolveTokenColor } from './primitive-colors';

export type CodeOutputMode = 'jsx' | 'props';

function formatNumber(n: number): string {
  const rounded = Math.round(n * 1000) / 1000;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function tokenCommentLines(state: PlaygroundState): string[] {
  const lines = state.colorSlots.map(
    (slot, i) =>
      ` * - colors[${i}]: color.${slot.path} @ ${slot.opacity}%`,
  );
  lines.push(
    ` * colorBack: color.${state.colorBack.path} @ ${state.colorBack.opacity}%`,
  );
  return lines;
}

function buildResolvedProps(state: PlaygroundState): Record<string, unknown> {
  const colors = state.colorSlots.map((slot) => resolveTokenColor(slot));
  const colorBack = resolveTokenColor(state.colorBack);

  const props: Record<string, unknown> = {
    colors,
    colorBack,
    softness: state.softness,
    intensity: state.intensity,
    noise: state.noise,
    shape: state.shape,
    speed: state.speed,
    scale: state.scale,
    rotation: state.rotation,
    offsetX: state.offsetX,
    offsetY: state.offsetY,
  };

  const width = parseDimensionInput(state.width);
  const height = parseDimensionInput(state.height);
  if (width !== '') props.width = width;
  if (height !== '') props.height = height;

  return props;
}

function serializePropValue(key: string, value: unknown, indent: string): string {
  if (Array.isArray(value)) {
    const inner = value.map((v) => JSON.stringify(v)).join(', ');
    return `${indent}${key}={[${inner}]}`;
  }
  if (typeof value === 'string') {
    return `${indent}${key}=${JSON.stringify(value)}`;
  }
  if (typeof value === 'number') {
    return `${indent}${key}={${formatNumber(value)}}`;
  }
  return `${indent}${key}=${JSON.stringify(value)}`;
}

export function formatGrainGradientCode(
  state: PlaygroundState,
  mode: CodeOutputMode,
): string {
  const props = buildResolvedProps(state);
  const comment = ['/**', ...tokenCommentLines(state), ' */'].join('\n');

  if (mode === 'props') {
    const body = JSON.stringify(props, null, 2);
    return `${comment}\n\nexport const GRAIN_PROPS = ${body};\n\n// Usage:\n// <GrainGradient width="100%" height="100%" fit="cover" {...GRAIN_PROPS} />`;
  }

  const propLines = Object.entries(props).map(([key, value]) =>
    serializePropValue(key, value, '  '),
  );

  return `import { GrainGradient } from '@paper-design/shaders-react';\n\n${comment}\n\n<GrainGradient\n${propLines.join('\n')}\n  fit="cover"\n/>`;
}

export function swatchSummary(state: PlaygroundState): string {
  return state.colorSlots
    .map((slot) => {
      const hex = resolveTokenColor(slot);
      const label = findColorByPath(slot.path)?.label ?? slot.path;
      return `${label} → ${hex}`;
    })
    .join('\n');
}
