# Baby Name Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current preset/random naming logic with a testable Chinese baby-name recommendation engine that prioritizes naturalness, pronunciation, semantic coherence, surname fit, and feedback-driven reranking.

**Architecture:** Split the current single-file app into focused static modules: curated data, hard filters, scoring, feedback learning, and UI rendering. Keep phase one fully client-side so it can run on GitHub Pages without a backend, while storing anonymous session preferences in `localStorage`.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, Node.js built-in test runner (`node --test`), GitHub Pages.

## Global Constraints

- Good-sounding names take priority over cultural citations.
- Show exactly 6 first-round recommendations when 6 valid candidates exist; never pad with low-quality candidates.
- Cultural citations must be optional and verifiable; never fabricate a source.
- Traditional fortune-telling is out of scope for phase one.
- The core flow must work on mobile screens at 360px width.
- No external runtime dependencies.

---

### Task 1: Establish modular project structure and baseline tests

**Files:**
- Create: `src/data/names.js`
- Create: `src/data/surnames.js`
- Create: `src/engine/filter.js`
- Create: `src/engine/score.js`
- Create: `src/engine/recommend.js`
- Create: `src/engine/feedback.js`
- Create: `tests/filter.test.js`
- Create: `tests/score.test.js`
- Create: `tests/recommend.test.js`
- Create: `package.json`

**Interfaces:**
- Produces: `filterCandidates(candidates, input) -> Candidate[]`
- Produces: `scoreCandidate(candidate, context) -> ScoreBreakdown`
- Produces: `recommendNames(candidates, context, limit = 6) -> RankedCandidate[]`
- Produces: `applyFeedback(profile, candidate, feedbackType) -> PreferenceProfile`

- [ ] **Step 1: Add Node test configuration**

Create `package.json`:

```json
{
  "name": "haoming-youjie",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Write failing filter tests**

Create `tests/filter.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCandidates } from '../src/engine/filter.js';

const candidates = [
  { name: '清和', chars: ['清', '和'], risks: [], polyphonic: false },
  { name: '行远', chars: ['行', '远'], risks: [], polyphonic: true },
  { name: '梓轩', chars: ['梓', '轩'], risks: ['avoid'], polyphonic: false }
];

test('removes polyphonic and avoided candidates', () => {
  const result = filterCandidates(candidates, { avoidChars: ['梓'], allowPolyphonic: false });
  assert.deepEqual(result.map(item => item.name), ['清和']);
});
```

- [ ] **Step 3: Run tests and verify failure**

Run:

```bash
npm test
```

Expected: FAIL because `src/engine/filter.js` does not exist.

- [ ] **Step 4: Implement minimal filter**

Create `src/engine/filter.js`:

```js
export function filterCandidates(candidates, input) {
  const avoid = new Set(input.avoidChars ?? []);
  return candidates.filter(candidate => {
    if (!input.allowPolyphonic && candidate.polyphonic) return false;
    if (candidate.chars.some(char => avoid.has(char))) return false;
    return true;
  });
}
```

- [ ] **Step 5: Run tests and verify pass**

Run `npm test`.
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json src/engine/filter.js tests/filter.test.js
git commit -m "test: establish naming engine baseline"
```

---

### Task 2: Build a curated candidate schema and seed dataset

**Files:**
- Create: `src/data/names.js`
- Create: `src/data/surnames.js`
- Create: `tests/data.test.js`

**Interfaces:**
- Produces: `NAME_CANDIDATES: Candidate[]`
- Produces: `SURNAME_RULES: Record<string, SurnameRule>`

- [ ] **Step 1: Write candidate-schema tests**

Create `tests/data.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { NAME_CANDIDATES } from '../src/data/names.js';

const requiredKeys = [
  'name', 'pinyin', 'tones', 'gender', 'styles', 'meanings',
  'naturalness', 'semanticCoherence', 'growthFit', 'writingEase',
  'source', 'sourceVerified', 'polyphonic', 'risks', 'chars'
];

test('every candidate follows the schema', () => {
  assert.ok(NAME_CANDIDATES.length >= 60);
  for (const candidate of NAME_CANDIDATES) {
    for (const key of requiredKeys) assert.ok(key in candidate, `${candidate.name} missing ${key}`);
    if (candidate.source) assert.equal(candidate.sourceVerified, true);
  }
});
```

- [ ] **Step 2: Run test and verify failure**

Run `npm test`.
Expected: FAIL because data files do not exist.

- [ ] **Step 3: Add surname rules**

Create `src/data/surnames.js` with at least the 100 most common surnames, each using this shape:

```js
export const SURNAME_RULES = {
  林: {
    tone: 2,
    avoidFullNamePatterns: ['林琳', '林霖', '林临'],
    preferredTonePatterns: [[2, 1, 3], [2, 4, 1], [2, 3, 2]],
    note: '姓氏音色柔和，宜搭配有起伏或较清朗的名字。'
  }
};
```

- [ ] **Step 4: Add at least 60 curated names**

Create `src/data/names.js`. Each item must use the tested schema. Example:

```js
export const NAME_CANDIDATES = [
  {
    name: '知远',
    chars: ['知', '远'],
    pinyin: ['zhī', 'yuǎn'],
    tones: [1, 3],
    gender: 'neutral',
    styles: ['温润', '稳重'],
    meanings: ['智慧', '志向'],
    naturalness: 92,
    semanticCoherence: 94,
    growthFit: 95,
    writingEase: 90,
    source: '诸葛亮《诫子书》：“非宁静无以致远。”',
    sourceVerified: true,
    polyphonic: false,
    risks: []
  }
];
```

Do not include a source unless the wording and context are checked.

- [ ] **Step 5: Run tests**

Run `npm test`.
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data tests/data.test.js
git commit -m "feat: add curated naming knowledge base"
```

---

### Task 3: Implement hard filtering and surname-risk checks

**Files:**
- Modify: `src/engine/filter.js`
- Create: `src/engine/risk.js`
- Modify: `tests/filter.test.js`

**Interfaces:**
- Produces: `detectFullNameRisks(surname, candidate, surnameRule) -> string[]`
- `filterCandidates` consumes these risks.

- [ ] **Step 1: Add failing risk tests**

Append to `tests/filter.test.js`:

```js
import { detectFullNameRisks } from '../src/engine/risk.js';

test('detects surname-specific repeated-sound risk', () => {
  const risks = detectFullNameRisks('林', { name: '霖安', chars: ['霖', '安'] }, {
    avoidFullNamePatterns: ['林霖']
  });
  assert.ok(risks.includes('surname-pattern'));
});

test('does not reject a clean full name', () => {
  const risks = detectFullNameRisks('林', { name: '知远', chars: ['知', '远'] }, {
    avoidFullNamePatterns: ['林霖']
  });
  assert.deepEqual(risks, []);
});
```

- [ ] **Step 2: Run and verify failure**

Run `npm test`.
Expected: FAIL because `risk.js` does not exist.

- [ ] **Step 3: Implement risk detector**

Create `src/engine/risk.js`:

```js
export function detectFullNameRisks(surname, candidate, surnameRule = {}) {
  const fullName = `${surname}${candidate.name}`;
  const risks = [];
  for (const pattern of surnameRule.avoidFullNamePatterns ?? []) {
    if (fullName.includes(pattern)) risks.push('surname-pattern');
  }
  return risks;
}
```

- [ ] **Step 4: Integrate into filter**

Update `filterCandidates` to accept `surname` and `surnameRule`, rejecting candidates with detected hard risks.

- [ ] **Step 5: Run tests and commit**

Run `npm test`.
Expected: PASS.

```bash
git add src/engine tests/filter.test.js
git commit -m "feat: add surname and full-name risk filtering"
```

---

### Task 4: Implement explainable scoring

**Files:**
- Create: `src/engine/score.js`
- Modify: `tests/score.test.js`

**Interfaces:**
- `scoreCandidate(candidate, context)` returns:

```js
{
  total: 0,
  naturalness: 0,
  pronunciation: 0,
  semantics: 0,
  surnameFit: 0,
  growthFit: 0,
  usability: 0
}
```

- [ ] **Step 1: Write failing score tests**

Create `tests/score.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreCandidate } from '../src/engine/score.js';

const candidate = {
  naturalness: 92,
  semanticCoherence: 94,
  growthFit: 95,
  writingEase: 90,
  tones: [1, 3],
  styles: ['温润'],
  meanings: ['智慧']
};

test('returns weighted explainable score', () => {
  const result = scoreCandidate(candidate, {
    surnameTone: 2,
    preferredTonePatterns: [[2, 1, 3]],
    stylePreferences: { 温润: 2 },
    meaningPreferences: { 智慧: 1 }
  });
  assert.ok(result.total >= 85);
  assert.equal(Object.keys(result).length, 7);
});
```

- [ ] **Step 2: Run and verify failure**

Run `npm test`.
Expected: FAIL.

- [ ] **Step 3: Implement weighted score**

Use exact weights:
- naturalness 30%
- pronunciation 25%
- semantics 15%
- surnameFit 10%
- growthFit 10%
- usability 10%

Pronunciation starts at 80, gains 15 for an exact preferred tone pattern, loses 10 for adjacent repeated tones, and is clamped to 0–100.

- [ ] **Step 4: Run tests and commit**

Run `npm test`.
Expected: PASS.

```bash
git add src/engine/score.js tests/score.test.js
git commit -m "feat: add explainable name scoring"
```

---

### Task 5: Implement diverse six-slot recommendation

**Files:**
- Create: `src/engine/recommend.js`
- Modify: `tests/recommend.test.js`

**Interfaces:**
- Produces six slots: `best`, `safe`, `rare`, `cultural`, `modern`, `explore`.

- [ ] **Step 1: Write failing diversity test**

Create `tests/recommend.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendNames } from '../src/engine/recommend.js';

const candidates = Array.from({ length: 10 }, (_, index) => ({
  name: `名字${index}`,
  styles: [index % 2 ? '现代' : '古典'],
  sourceVerified: index % 3 === 0,
  rarity: index * 10,
  score: { total: 90 - index }
}));

test('returns at most six unique candidates with slot labels', () => {
  const result = recommendNames(candidates, {}, 6);
  assert.equal(result.length, 6);
  assert.equal(new Set(result.map(item => item.name)).size, 6);
  assert.deepEqual(result.map(item => item.slot), ['best', 'safe', 'rare', 'cultural', 'modern', 'explore']);
});
```

- [ ] **Step 2: Run and verify failure**

Run `npm test`.
Expected: FAIL.

- [ ] **Step 3: Implement slot selection**

Select the highest-ranked unused candidate matching each slot. When a slot has no match, select the highest-ranked unused candidate without fabricating a category claim.

- [ ] **Step 4: Run tests and commit**

Run `npm test`.
Expected: PASS.

```bash
git add src/engine/recommend.js tests/recommend.test.js
git commit -m "feat: add diverse six-slot recommendations"
```

---

### Task 6: Implement feedback preference learning

**Files:**
- Create: `src/engine/feedback.js`
- Create: `tests/feedback.test.js`

**Interfaces:**
- `applyFeedback(profile, candidate, feedbackType)` returns a new immutable profile.

- [ ] **Step 1: Write failing feedback tests**

Create `tests/feedback.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyFeedback } from '../src/engine/feedback.js';

const candidate = { styles: ['古典'], meanings: ['智慧'], tones: [1, 3], rarity: 40 };

test('too traditional lowers classical preference', () => {
  const result = applyFeedback({}, candidate, 'too-traditional');
  assert.equal(result.styles.古典, -2);
});

test('like increases matching traits', () => {
  const result = applyFeedback({}, candidate, 'like');
  assert.equal(result.styles.古典, 2);
  assert.equal(result.meanings.智慧, 2);
});
```

- [ ] **Step 2: Run and verify failure**

Run `npm test`.
Expected: FAIL.

- [ ] **Step 3: Implement immutable feedback updates**

Support exact feedback values:
- `like`
- `too-common`
- `too-traditional`
- `bad-sound`
- `too-complex`
- `bad-meaning`

- [ ] **Step 4: Run tests and commit**

Run `npm test`.
Expected: PASS.

```bash
git add src/engine/feedback.js tests/feedback.test.js
git commit -m "feat: add feedback-driven preference learning"
```

---

### Task 7: Replace the current UI with the tested engine

**Files:**
- Replace: `index.html`
- Create: `src/app.js`
- Create: `src/styles.css`
- Create: `tests/ui-smoke.test.js`

**Interfaces:**
- UI imports data and engine modules.
- Persists preference profile under `localStorage` key `haoming.preference.v1`.

- [ ] **Step 1: Write static UI smoke test**

Create `tests/ui-smoke.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('index exposes required workflow controls', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['surname', 'gender', 'generate', 'recommendations', 'compare']) {
    assert.ok(html.includes(`id="${id}"`), `missing ${id}`);
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run `npm test`.
Expected: FAIL because the current index is only a redirect.

- [ ] **Step 3: Build the five-step interface**

The interface must contain:
1. Basic inputs.
2. Optional aesthetic choices.
3. Six recommendation cards.
4. Feedback actions.
5. Three-name comparison drawer.

Use semantic buttons and visible focus styles. Do not display unsupported collision-rate statistics.

- [ ] **Step 4: Wire engine modules**

In `src/app.js`:
- read input
- filter candidates
- score candidates
- generate six slots
- render evidence labels
- apply feedback
- persist profile
- rerank after feedback
- compare up to three names

- [ ] **Step 5: Run tests**

Run `npm test`.
Expected: PASS.

- [ ] **Step 6: Manual mobile verification**

Run:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` at 360px viewport.
Expected: no horizontal scrolling; all primary buttons reachable; recommendation cards readable.

- [ ] **Step 7: Commit**

```bash
git add index.html src tests/ui-smoke.test.js
git commit -m "feat: ship feedback-driven baby naming experience"
```

---

### Task 8: Verify deployment instead of assuming it

**Files:**
- Modify: `.github/workflows/pages.yml`
- Create: `DEPLOYMENT.md`

**Interfaces:**
- GitHub Actions deploys the repository root.

- [ ] **Step 1: Add deployment documentation**

Document:
- required Pages source: GitHub Actions
- expected production URL
- how to inspect Actions failures
- how to verify `index.html` returns HTTP 200

- [ ] **Step 2: Validate workflow syntax**

Ensure `.github/workflows/pages.yml` uses:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

and deploys `path: .`.

- [ ] **Step 3: Push and inspect the workflow run**

Expected: `deploy` job succeeds.

- [ ] **Step 4: Verify public URL**

Run:

```bash
curl -I https://neal58.github.io/Energy-Storage-AI/
```

Expected: HTTP 200. Do not report deployment success unless this check passes.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/pages.yml DEPLOYMENT.md
git commit -m "docs: add verified deployment procedure"
```
