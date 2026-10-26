import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { CodePanel } from './components/CodePanel';
import { Controls, type RecipePanelMeta } from './components/Controls';
import { Preview, type PreviewHandle } from './components/Preview';
import { Toast, type ToastTone } from './components/Toast';
import { DEFAULT_PLAYGROUND_STATE, type PlaygroundState } from './lib/defaults';
import {
  defaultExportSlug,
  downloadRecipeJson,
  parseRecipeFile,
  pngFilename,
  recipeFilename,
  slugFromRecipeName,
  stateToRecipe,
} from './lib/grain-recipe';
import { randomizePlaygroundState } from './lib/randomize';
import { PRIMITIVE_COLOR_OPTIONS } from './lib/primitive-colors';

export function App() {
  const [state, setState] = useState(DEFAULT_PLAYGROUND_STATE);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [frameMs, setFrameMs] = useState(0);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(
    null,
  );
  const [previewSessionKey, setPreviewSessionKey] = useState(0);
  const [recipeMeta, setRecipeMeta] = useState<RecipePanelMeta | null>(null);
  const [recipeEdited, setRecipeEdited] = useState(false);
  const previewRef = useRef<PreviewHandle>(null);
  const recipeInputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const loadedStateBaselineRef = useRef<string | null>(null);

  function snapshotPlaygroundState(s: PlaygroundState): string {
    return JSON.stringify(s);
  }

  const applyControlsChange = useCallback((next: PlaygroundState) => {
    setState(next);
    const baseline = loadedStateBaselineRef.current;
    if (baseline !== null) {
      setRecipeEdited(snapshotPlaygroundState(next) !== baseline);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  function dismissToast() {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
  }

  function showToast(message: string, tone: ToastTone = 'success') {
    dismissToast();
    setToast({ message, tone });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 8000);
  }

  async function handleSave() {
    const slug = defaultExportSlug();
    const snapshotFrameMs = previewRef.current?.getCurrentFrame() ?? frameMs;

    const pngOk = await previewRef.current?.downloadPng(pngFilename(slug));
    const recipe = stateToRecipe(state, {
      name: slug,
      // Paired PNG is a still; recipe must load frozen at this frame.
      paused: true,
      frameMs: snapshotFrameMs,
    });
    downloadRecipeJson(recipe, slug);

    loadedStateBaselineRef.current = snapshotPlaygroundState(state);
    setRecipeMeta({
      recipeFile: recipeFilename(slug),
      pngFile: pngFilename(slug),
      frameMs: snapshotFrameMs,
    });
    setRecipeEdited(false);

    if (pngOk) {
      showToast('Saved recipe and PNG.');
    } else {
      showToast('Recipe JSON saved; PNG export failed.', 'error');
    }
  }

  function applyImportedRecipe(text: string) {
    try {
      const { name, state: nextState, paused, frameMs: nextFrameMs, warnings } =
        parseRecipeFile(text);

      previewRef.current?.applyRecipePlayback({
        paused,
        frameMs: nextFrameMs,
        speed: nextState.speed,
      });

      flushSync(() => {
        setAnimationPaused(paused);
        setFrameMs(nextFrameMs);
        setState(nextState);
        setPreviewSessionKey((key) => key + 1);
      });

      const slug = slugFromRecipeName(name);
      loadedStateBaselineRef.current = snapshotPlaygroundState(nextState);
      setRecipeMeta({
        recipeFile: recipeFilename(slug),
        pngFile: pngFilename(slug),
        frameMs: nextFrameMs,
        loadWarnings: warnings.length > 0 ? warnings : undefined,
      });
      setRecipeEdited(false);

      showToast(
        warnings.length > 0 ? 'Recipe loaded with warnings.' : 'Recipe loaded.',
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not load recipe.';
      showToast(message, 'error');
    }
  }

  function handlePasteRecipe() {
    const text = window.prompt('Paste grain recipe JSON');
    if (text?.trim()) {
      applyImportedRecipe(text);
    }
  }

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

  const headerBtnPrimary =
    'rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
  const headerBtnOutline =
    'rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs ring-1 ring-indigo-200 ring-inset hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-row">
          <h1>Grain Gradient</h1>
          <span className="app-header-meta">Trust &amp; Will design tokens</span>
          <div className="app-header-actions">
            <button
              type="button"
              className={headerBtnPrimary}
              onClick={() => recipeInputRef.current?.click()}
            >
              Load recipe
            </button>
            <button
              type="button"
              className={headerBtnOutline}
              onClick={handlePasteRecipe}
            >
              Paste JSON
            </button>
            <input
              ref={recipeInputRef}
              type="file"
              accept=".json,application/json,.grainrecipe.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void file.text().then(applyImportedRecipe);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </header>

      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onDismiss={dismissToast} />
      ) : null}

      <div className="workspace">
        <div className="main-column">
          <section className="preview-section">
            <div className="preview-canvas-area">
              <Preview
                ref={previewRef}
                state={state}
                paused={animationPaused}
                frameMs={frameMs}
                playbackKey={previewSessionKey}
              />
            </div>
            <div className="preview-actions">
              <button
                type="button"
                className="playback-button"
                aria-pressed={animationPaused}
                onClick={() => {
                  if (!animationPaused) {
                    const nowMs =
                      previewRef.current?.getCurrentFrame() ?? frameMs;
                    setFrameMs(nowMs);
                  }
                  setAnimationPaused((paused) => !paused);
                }}
              >
                {animationPaused ? 'Play' : 'Pause'}
              </button>
              <button
                type="button"
                className="save-button"
                onClick={() => {
                  void handleSave();
                }}
              >
                Save
              </button>
            </div>
          </section>
          <CodePanel state={state} />
        </div>
        <Controls
          state={state}
          recipeMeta={recipeMeta}
          recipeEdited={recipeEdited}
          onChange={applyControlsChange}
          onRandomize={() =>
            applyControlsChange(randomizePlaygroundState(state))
          }
        />
      </div>
    </div>
  );
}
