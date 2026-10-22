import type { ReactNode } from 'react';
import type { PlaygroundState, GrainShape } from '../lib/defaults';
import {
  COLOR_FAMILIES,
  colorPathFromParts,
  defaultColorPath,
  parseColorPath,
  resolveTokenColor,
  shadesForFamily,
  type TokenColorSlot,
} from '../lib/primitive-colors';

type ControlsProps = {
  state: PlaygroundState;
  onChange: (next: PlaygroundState) => void;
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

/** Panel density — Tailwind has no global “compact” switch; tune spacing/type here. */
const fieldInput =
  'block w-full rounded-md bg-white px-2 py-1 text-xs leading-tight text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600';

const fieldSelect = `${fieldInput} appearance-none pr-7`;

const btnSecondary =
  'shrink-0 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50';

const btnGhostIcon =
  'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600';

const rangeInput =
  'h-1 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-gray-200 accent-indigo-600';

const btnBlock =
  'w-full rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50';

const colorRowSurface =
  'rounded-md bg-gray-50/80 px-2 py-1.5 ring-1 ring-gray-200 ring-inset';

const sectionDivider = 'border-t border-gray-200 pt-3.5';

const panelPadding = 'px-3 py-3 sm:px-4';
const panelSections = 'space-y-3.5';
const panelFields = 'space-y-2';
const panelColorStack = 'space-y-1.5';

function SelectChevron() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-gray-500"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[10px] leading-none font-semibold tracking-wide text-gray-500 uppercase">
      {children}
    </h2>
  );
}

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-x-3 gap-y-0.5 sm:grid-cols-[5.25rem_minmax(0,1fr)]">
      <label className="text-xs font-medium text-gray-900 sm:col-span-1">
        {label}
      </label>
      <div className="min-w-0 sm:col-span-1">{children}</div>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  children,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  'aria-label'?: string;
}) {
  return (
    <div className="relative min-w-0">
      <select
        className={fieldSelect}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <SelectChevron />
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
  const { family, shade } = parseColorPath(slot.path);
  const shadeOptions = shadesForFamily(family);

  return (
    <div className={colorRowSurface}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-900">{label}</span>
        {onRemove ? (
          <button
            type="button"
            className={btnGhostIcon}
            aria-label={`Remove ${label}`}
            onClick={onRemove}
          >
            <span aria-hidden className="text-base leading-none">
              ×
            </span>
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-[1rem_minmax(0,1fr)_minmax(0,1fr)_1.75rem_minmax(0,3rem)] items-center gap-1.5">
        <span
          className="size-4 shrink-0 rounded shadow-xs ring-1 ring-gray-300 ring-inset"
          style={{ backgroundColor: resolved }}
          title={resolved}
        />
        <SelectField
          value={family}
          aria-label={`${label} family`}
          onChange={(nextFamily) => {
            const nextShades = shadesForFamily(nextFamily);
            const nextShade = nextShades.includes(shade)
              ? shade
              : nextShades[0] ?? shade;
            onSlotChange({
              ...slot,
              path: colorPathFromParts(nextFamily, nextShade),
            });
          }}
        >
          {COLOR_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </SelectField>
        <SelectField
          value={shade}
          aria-label={`${label} shade`}
          onChange={(nextShade) =>
            onSlotChange({
              ...slot,
              path: colorPathFromParts(family, nextShade),
            })
          }
        >
          {shadeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
        <span className="text-right text-[10px] font-medium text-gray-500 tabular-nums">
          {slot.opacity}%
        </span>
        <input
          className={rangeInput}
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
      </div>
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
      className={fieldInput}
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
    <div className="flex min-w-0 items-center gap-2">
      <input
        className={rangeInput}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-8 shrink-0 text-right text-[10px] font-medium text-gray-500 tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function Controls({
  state,
  onChange,
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
    <aside className="flex h-full max-h-[45vh] min-h-0 w-full max-w-none shrink-0 flex-col border-t border-gray-200 bg-white font-sans antialiased max-lg:overflow-hidden lg:max-h-none lg:w-[360px] lg:border-t-0 lg:border-l">
      <div className={`flex-1 overflow-x-hidden overflow-y-auto ${panelPadding}`}>
        <div className={panelSections}>
          <section className={panelFields}>
            <ControlRow label="Shape">
              <div className="flex min-w-0 items-center gap-1.5">
                <div className="min-w-0 flex-1">
                  <SelectField
                    value={state.shape}
                    aria-label="Shape"
                    onChange={(shape) =>
                      patch({ shape: shape as GrainShape })
                    }
                  >
                    {SHAPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={onRandomize}
                >
                  Randomize
                </button>
              </div>
            </ControlRow>
          </section>

          <section className={`${panelFields} ${sectionDivider}`}>
            <SectionTitle>Colors</SectionTitle>

            <div className={panelColorStack}>
              {state.colorSlots.map((slot, index) => (
                <ColorSlotRow
                  key={index}
                  label={`Color ${index + 1}`}
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
              <button
                type="button"
                className={btnBlock}
                onClick={addColorSlot}
              >
                Add color
              </button>
            )}

            <ColorSlotRow
              label="Background color"
              slot={state.colorBack}
              onSlotChange={(colorBack) => patch({ colorBack })}
            />
          </section>

          <section className={`${panelFields} ${sectionDivider}`}>
            <SectionTitle>Effects</SectionTitle>

            <ControlRow label="Softness">
              <RangeInput
                value={state.softness}
                min={0}
                max={1}
                step={0.01}
                onChange={(softness) => patch({ softness })}
              />
            </ControlRow>
            <ControlRow label="Intensity">
              <RangeInput
                value={state.intensity}
                min={0}
                max={1}
                step={0.01}
                onChange={(intensity) => patch({ intensity })}
              />
            </ControlRow>
            <ControlRow label="Noise">
              <RangeInput
                value={state.noise}
                min={0}
                max={1}
                step={0.01}
                onChange={(noise) => patch({ noise })}
              />
            </ControlRow>
          </section>

          <section className={`${panelFields} pb-1 ${sectionDivider}`}>
            <SectionTitle>Controls</SectionTitle>

            <ControlRow label="Speed">
              <RangeInput
                value={state.speed}
                min={0}
                max={2}
                step={0.01}
                onChange={(speed) => patch({ speed })}
              />
            </ControlRow>

            <ControlRow label="Scale">
              <RangeInput
                value={state.scale}
                min={0.01}
                max={4}
                step={0.01}
                onChange={(scale) => patch({ scale })}
              />
            </ControlRow>
            <ControlRow label="Rotation">
              <RangeInput
                value={state.rotation}
                min={0}
                max={360}
                step={1}
                onChange={(rotation) => patch({ rotation })}
              />
            </ControlRow>
            <ControlRow label="Offset X">
              <RangeInput
                value={state.offsetX}
                min={-1}
                max={1}
                step={0.01}
                onChange={(offsetX) => patch({ offsetX })}
              />
            </ControlRow>
            <ControlRow label="Offset Y">
              <RangeInput
                value={state.offsetY}
                min={-1}
                max={1}
                step={0.01}
                onChange={(offsetY) => patch({ offsetY })}
              />
            </ControlRow>
            <ControlRow label="Width">
              <TextInput
                value={state.width}
                placeholder="1280"
                onChange={(width) => patch({ width })}
              />
            </ControlRow>
            <ControlRow label="Height">
              <TextInput
                value={state.height}
                placeholder="720"
                onChange={(height) => patch({ height })}
              />
            </ControlRow>
          </section>
        </div>
      </div>
    </aside>
  );
}
