export type PaperShaderMount = {
  getCurrentFrame?: () => number;
  render: (time: number) => void;
  setFrame?: (frame: number) => void;
  setSpeed?: (speed: number) => void;
};

export function getPaperShaderMount(
  container: HTMLElement,
): PaperShaderMount | null {
  const canvas = container.querySelector('canvas');
  const host = canvas?.parentElement;
  if (!host || !('paperShaderMount' in host)) return null;
  return (host as HTMLElement & { paperShaderMount?: PaperShaderMount })
    .paperShaderMount ?? null;
}

export function readCurrentFrameMs(container: HTMLElement): number {
  const mount = getPaperShaderMount(container);
  if (!mount?.getCurrentFrame) return 0;
  return Math.max(0, mount.getCurrentFrame());
}

/** Stop or resume the live Paper mount immediately (before React re-renders). */
export function applyPlaybackToContainer(
  container: HTMLElement,
  options: { paused: boolean; frameMs: number; speed: number },
): boolean {
  const mount = getPaperShaderMount(container);
  if (!mount) return false;

  const frameMs = Math.max(0, options.frameMs);

  if (options.paused) {
    mount.setSpeed?.(0);
    if (typeof mount.setFrame === 'function') {
      mount.setFrame(frameMs);
    } else {
      mount.render(frameMs);
    }
    return true;
  }

  if (typeof mount.setFrame === 'function') {
    mount.setFrame(frameMs);
  } else {
    mount.render(frameMs);
  }
  mount.setSpeed?.(options.speed);
  return true;
}
