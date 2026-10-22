import { GrainGradient } from '@paper-design/shaders-react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { PlaygroundState } from '../lib/defaults';
import { parseDimensionInput } from '../lib/defaults';
import { downloadPreviewPng } from '../lib/download-preview-png';
import { resolveTokenColor } from '../lib/primitive-colors';

export type PreviewHandle = {
  downloadPng: (filename?: string) => Promise<boolean>;
};

type PreviewProps = {
  state: PlaygroundState;
  animationSpeed: number;
};

const WEBGL_CAPTURE_ATTRIBUTES = {
  preserveDrawingBuffer: true,
} as const;

export const Preview = forwardRef<PreviewHandle, PreviewProps>(
  function Preview({ state, animationSpeed }, ref) {
    const frameRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      downloadPng(filename) {
        const container = frameRef.current;
        if (!container) return Promise.resolve(false);

        const colorBack = resolveTokenColor(state.colorBack);
        return downloadPreviewPng(container, {
          filename,
          backgroundColor: colorBack,
        });
      },
    }));

    const colors = state.colorSlots.map((slot) => resolveTokenColor(slot));
    const colorBack = resolveTokenColor(state.colorBack);

    const width = parseDimensionInput(state.width);
    const height = parseDimensionInput(state.height);

    return (
      <div className="preview-frame" ref={frameRef}>
        <GrainGradient
          colors={colors}
          colorBack={colorBack}
          softness={state.softness}
          intensity={state.intensity}
          noise={state.noise}
          shape={state.shape}
          speed={animationSpeed}
          scale={state.scale}
          rotation={state.rotation}
          offsetX={state.offsetX}
          offsetY={state.offsetY}
          width={width === '' ? '100%' : width}
          height={height === '' ? '100%' : height}
          fit="cover"
          webGlContextAttributes={WEBGL_CAPTURE_ATTRIBUTES}
        />
      </div>
    );
  },
);
