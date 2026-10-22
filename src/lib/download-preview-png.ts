type PaperShaderMount = {
  render: (time: number) => void;
};

function getShaderMountHost(canvas: HTMLCanvasElement): HTMLElement | null {
  return canvas.parentElement;
}

function forceShaderPaint(canvas: HTMLCanvasElement): void {
  const host = getShaderMountHost(canvas);
  if (!host || !('paperShaderMount' in host)) return;
  const mount = (host as HTMLElement & { paperShaderMount?: PaperShaderMount })
    .paperShaderMount;
  mount?.render(performance.now());
}

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function hexToOpaqueCss(hex: string): string {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 8) {
    return `#${normalized.slice(0, 6)}`;
  }
  if (normalized.length === 6) {
    return `#${normalized}`;
  }
  return '#000000';
}

export async function downloadPreviewPng(
  container: HTMLElement,
  options?: { filename?: string; backgroundColor?: string },
): Promise<boolean> {
  const source = container.querySelector('canvas');
  if (!source || source.width === 0 || source.height === 0) {
    return false;
  }

  forceShaderPaint(source);
  await waitForNextPaint();
  forceShaderPaint(source);

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = source.width;
  exportCanvas.height = source.height;

  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return false;

  const bg = options?.backgroundColor
    ? hexToOpaqueCss(options.backgroundColor)
    : '#000000';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  try {
    ctx.drawImage(source, 0, 0);
  } catch {
    return false;
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    exportCanvas.toBlob((b) => resolve(b), 'image/png');
  });

  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = options?.filename ?? `grain-gradient-${Date.now()}.png`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}
