/**
 * Regression: paired export/import must always pause at frameMs.
 * Run: npx tsx scripts/verify-recipe-pause.ts
 */
import assert from 'node:assert/strict';
import { DEFAULT_PLAYGROUND_STATE } from '../src/lib/defaults.ts';
import {
  GRAIN_RECIPE_VERSION,
  recipeToEditorState,
  stateToRecipe,
} from '../src/lib/grain-recipe.ts';

const exported = stateToRecipe(DEFAULT_PLAYGROUND_STATE, {
  name: 'grain-test',
  paused: true,
  frameMs: 8420,
});

assert.equal(exported.paused, true, 'export must write paused:true');
assert.equal(exported.frameMs, 8420);

const legacyPlaying = {
  ...exported,
  grainRecipe: GRAIN_RECIPE_VERSION,
  paused: false,
};

const imported = recipeToEditorState(legacyPlaying);
assert.equal(
  imported.paused,
  true,
  'import must pause even when file says false',
);
assert.equal(imported.frameMs, 8420);
assert.ok(
  imported.warnings.some((w) => w.includes('paused:false')),
  'legacy false should warn',
);

console.log('verify-recipe-pause: ok');
