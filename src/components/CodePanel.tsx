import { useState } from 'react';
import type { CodeOutputMode } from '../lib/format-code';
import { formatGrainGradientCode } from '../lib/format-code';
import type { PlaygroundState } from '../lib/defaults';

type CodePanelProps = {
  state: PlaygroundState;
};

export function CodePanel({ state }: CodePanelProps) {
  const [mode, setMode] = useState<CodeOutputMode>('jsx');
  const [copied, setCopied] = useState(false);
  const code = formatGrainGradientCode(state, mode);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="code-panel">
      <div className="code-panel-header">
        <h2>Code</h2>
        <div className="code-panel-actions">
          <label className="inline-label">
            Output
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as CodeOutputMode)}
            >
              <option value="jsx">JSX</option>
              <option value="props">GRAIN_PROPS object</option>
            </select>
          </label>
          <button type="button" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="code-block">{code}</pre>
    </section>
  );
}
