import { GrainGradient } from '@paper-design/shaders-react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { PlaygroundState } from '../lib/defaults';
import { parseDimensionInput } from '../lib/defaults';
import { downloadPreviewPng } from '../lib/download-preview-png';
import {
  applyPlaybackToContainer,
  readCurrentFrameMs,
} from '../lib/paper-shader-mount';
import { resolveTokenColor } from '../lib/primitive-colors';

export type PreviewHandle = {
  downloadPng: (filename?: string) => Promise<boolean>;
  getCurrentFrame: () => number;
  applyRecipePlayback: (options: {
    paused: boolean;
    frameMs: number;
    speed: number;
  }) => void;
};

type PreviewProps = {
  state: PlaygroundState;
  /** Play/pause from recipe or toolbar — when true, shader speed is forced to 0. */
  paused: boolean;
  frameMs: number;
  /** Bumps when a recipe is imported so GrainGradient remounts with correct speed/frame. */
  playbackKey: number;
};

const WEBGL_CAPTURE_ATTRIBUTES = {
  preserveDrawingBuffer: true,
} as const;

export const Preview = forwardRef<PreviewHandle, PreviewProps>(
  function Preview({ state, paused, frameMs, playbackKey }, ref) {
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
      getCurrentFrame() {
        const container = frameRef.current;
        if (!container) return 0;
        return readCurrentFrameMs(container);
      },
      applyRecipePlayback(options) {
        const container = frameRef.current;
        if (!container) return;
        applyPlaybackToContainer(container, options);
      },
    }));

    const colors = state.colorSlots.map((slot) => resolveTokenColor(slot));
    const colorBack = resolveTokenColor(state.colorBack);

    const width = parseDimensionInput(state.width);
    const height = parseDimensionInput(state.height);
    const shaderSpeed = paused ? 0 : state.speed;

    useEffect(() => {
      if (!paused) return;
      const container = frameRef.current;
      if (!container) return;

      let cancelled = false;
      let attempts = 0;

      const trySync = () => {
        if (cancelled || !frameRef.current) return;
        if (
          applyPlaybackToContainer(frameRef.current, {
            paused: true,
            frameMs,
            speed: 0,
          })
        ) {
          return;
        }
        if (attempts >= 24) return;
        attempts += 1;
        window.requestAnimationFrame(trySync);
      };

      trySync();
      return () => {
        cancelled = true;
      };
    }, [paused, frameMs, playbackKey, state.shape]);

    const grainKey = `${playbackKey}-${paused ? 'paused' : 'playing'}-${Math.round(frameMs)}`;

    return (
      <div className="preview-frame" ref={frameRef}>
        <GrainGradient
          key={grainKey}
          colors={colors}
          colorBack={colorBack}
          softness={state.softness}
          intensity={state.intensity}
          noise={state.noise}
          shape={state.shape}
          speed={shaderSpeed}
          frame={frameMs}
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
