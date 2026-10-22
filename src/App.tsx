import { useRef, useState } from 'react';
import { CodePanel } from './components/CodePanel';
import { Controls } from './components/Controls';
import { Preview, type PreviewHandle } from './components/Preview';
import { DEFAULT_PLAYGROUND_STATE } from './lib/defaults';
import { randomizePlaygroundState } from './lib/randomize';
import { PRIMITIVE_COLOR_OPTIONS } from './lib/primitive-colors';

export function App() {
  const [state, setState] = useState(DEFAULT_PLAYGROUND_STATE);
  const [animationPaused, setAnimationPaused] = useState(false);
  const previewRef = useRef<PreviewHandle>(null);

  const animationSpeed = animationPaused ? 0 : state.speed;

  if (PRIMITIVE_COLOR_OPTIONS.length === 0) {
    return (
      <main className="app error-state">
        <h1>Grain Gradient playground</h1>
        <p>
          Design token files were not found. Clone{' '}
          <code>tw-nx-web</code> as a sibling of <code>company-brain</code>{' '}
          or set <code>TW_NX_WEB_ROOT</code> to that repo path, then restart{' '}
          <code>npm run dev</code>.
        </p>
      </main>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Grain Gradient</h1>
        <span className="app-header-meta">Trust &amp; Will design tokens</span>
      </header>

      <div className="workspace">
        <div className="main-column">
          <section className="preview-section">
            <Preview
              ref={previewRef}
              state={state}
              animationSpeed={animationSpeed}
            />
            <button
              type="button"
              className="download-button"
              onClick={() => {
                void previewRef.current?.downloadPng();
              }}
            >
              Download PNG
            </button>
          </section>
          <CodePanel state={state} />
        </div>
        <Controls
          state={state}
          animationPaused={animationPaused}
          onChange={setState}
          onTogglePause={() => setAnimationPaused((paused) => !paused)}
          onRandomize={() =>
            setState((current) => randomizePlaygroundState(current))
          }
        />
      </div>
    </div>
  );
}
