import type { ReactNode } from 'react';
import type { PlaygroundState, GrainShape } from '../lib/defaults';
import {
  PRIMITIVE_COLOR_OPTIONS,
  defaultColorPath,
  resolveTokenColor,
  type TokenColorSlot,
} from '../lib/primitive-colors';

type ControlsProps = {
  state: PlaygroundState;
  animationPaused: boolean;
  onChange: (next: PlaygroundState) => void;
  onTogglePause: () => void;
  onRandomize: () => void;
};

const SHAPES: GrainShape[] = [
  'wave',
  'dots',
  'truchet',
  'corners',
  'ripple',
  'blob',
];

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="control-row">
      <span className="control-label">{label}</span>
      <div className="control-value">{children}</div>
    </div>
  );
}

function ColorSlotRow({
  label,
  slot,
  onSlotChange,
  onRemove,
}: {
  label: string;
  slot: TokenColorSlot;
  onSlotChange: (slot: TokenColorSlot) => void;
  onRemove?: () => void;
}) {
  const resolved = resolveTokenColor(slot);

  return (
    <div className="color-row">
      <span className="control-label">{label}</span>
      <span
        className="swatch"
        style={{ backgroundColor: resolved }}
        title={resolved}
      />
      <select
        className="color-select"
        value={slot.path}
        onChange={(e) => onSlotChange({ ...slot, path: e.target.value })}
      >
        {PRIMITIVE_COLOR_OPTIONS.map((opt) => (
          <option key={opt.path} value={opt.path}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="opacity-value">{slot.opacity}%</span>
      <input
        className="opacity-range"
        type="range"
        min={0}
        max={100}
        step={1}
        value={slot.opacity}
        aria-label={`${label} opacity`}
        onChange={(e) =>
          onSlotChange({ ...slot, opacity: Number(e.target.value) })
        }
      />
      {onRemove && (
        <button
          type="button"
          className="icon-button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="input-compact"
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function RangeInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="range-inline">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="range-number">{value}</span>
    </div>
  );
}

export function Controls({
  state,
  animationPaused,
  onChange,
  onTogglePause,
  onRandomize,
}: ControlsProps) {
  function patch(partial: Partial<PlaygroundState>) {
    onChange({ ...state, ...partial });
  }

  function updateColorSlot(index: number, slot: TokenColorSlot) {
    const colorSlots = [...state.colorSlots];
    colorSlots[index] = slot;
    patch({ colorSlots });
  }

  function addColorSlot() {
    if (state.colorSlots.length >= 7) return;
    patch({
      colorSlots: [
        ...state.colorSlots,
        { path: defaultColorPath(), opacity: 100 },
      ],
    });
  }

  function removeColorSlot(index: number) {
    if (state.colorSlots.length <= 1) return;
    patch({
      colorSlots: state.colorSlots.filter((_, i) => i !== index),
    });
  }

  return (
    <aside className="controls">
      <div className="controls-inner">
        <ControlRow label="shape">
          <div className="control-value-split">
            <select
              className="input-compact"
              value={state.shape}
              onChange={(e) => patch({ shape: e.target.value as GrainShape })}
            >
              {SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="button" className="button-inline" onClick={onRandomize}>
              Randomize
            </button>
          </div>
        </ControlRow>

        <p className="control-section-title">Shader props</p>

        <div className="color-slots">
          {state.colorSlots.map((slot, index) => (
            <ColorSlotRow
              key={index}
              label={`colors[${index}]`}
              slot={slot}
              onSlotChange={(s) => updateColorSlot(index, s)}
              onRemove={
                state.colorSlots.length > 1
                  ? () => removeColorSlot(index)
                  : undefined
              }
            />
          ))}
        </div>

        {state.colorSlots.length < 7 && (
          <button type="button" className="button-compact" onClick={addColorSlot}>
            Add color
          </button>
        )}

        <ColorSlotRow
          label="colorBack"
          slot={state.colorBack}
          onSlotChange={(colorBack) => patch({ colorBack })}
        />

        <ControlRow label="softness">
          <RangeInput
            value={state.softness}
            min={0}
            max={1}
            step={0.01}
            onChange={(softness) => patch({ softness })}
          />
        </ControlRow>
        <ControlRow label="intensity">
          <RangeInput
            value={state.intensity}
            min={0}
            max={1}
            step={0.01}
            onChange={(intensity) => patch({ intensity })}
          />
        </ControlRow>
        <ControlRow label="noise">
          <RangeInput
            value={state.noise}
            min={0}
            max={1}
            step={0.01}
            onChange={(noise) => patch({ noise })}
          />
        </ControlRow>

        <p className="control-section-title">Common props</p>

        <ControlRow label="speed">
          <div className="control-value-split">
            <RangeInput
              value={state.speed}
              min={0}
              max={2}
              step={0.01}
              onChange={(speed) => patch({ speed })}
            />
            <button
              type="button"
              className="button-inline"
              aria-pressed={animationPaused}
              onClick={onTogglePause}
            >
              {animationPaused ? 'Play' : 'Pause'}
            </button>
          </div>
        </ControlRow>

        <ControlRow label="scale">
          <RangeInput
            value={state.scale}
            min={0.01}
            max={4}
            step={0.01}
            onChange={(scale) => patch({ scale })}
          />
        </ControlRow>
        <ControlRow label="rotation">
          <RangeInput
            value={state.rotation}
            min={0}
            max={360}
            step={1}
            onChange={(rotation) => patch({ rotation })}
          />
        </ControlRow>
        <ControlRow label="offsetX">
          <RangeInput
            value={state.offsetX}
            min={-1}
            max={1}
            step={0.01}
            onChange={(offsetX) => patch({ offsetX })}
          />
        </ControlRow>
        <ControlRow label="offsetY">
          <RangeInput
            value={state.offsetY}
            min={-1}
            max={1}
            step={0.01}
            onChange={(offsetY) => patch({ offsetY })}
          />
        </ControlRow>
        <ControlRow label="width">
          <TextInput
            value={state.width}
            placeholder="1280"
            onChange={(width) => patch({ width })}
          />
        </ControlRow>
        <ControlRow label="height">
          <TextInput
            value={state.height}
            placeholder="720"
            onChange={(height) => patch({ height })}
          />
        </ControlRow>
      </div>
    </aside>
  );
}
