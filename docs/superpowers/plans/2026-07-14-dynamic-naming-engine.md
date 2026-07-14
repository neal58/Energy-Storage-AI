# Dynamic Chinese Naming Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed-name recommender with a browser-based dynamic Chinese baby naming engine driven by parents’ surnames, birth profile, user constraints, semantic relations, phonology, and risk filtering.

**Architecture:** Keep the source modular, use `lunar-javascript@1.7.7` for calendar and four-pillar facts, generate names from character-role pools and explicit semantic relations, then bundle all code and CSS into a single root `index.html` so HTML Preview works reliably. All personal data remains local in the browser.

**Tech Stack:** Vanilla JavaScript ES modules, `lunar-javascript@1.7.7`, `esbuild`, Node.js built-in test runner, GitHub Actions.

## Global Constraints

- No fixed full-name list may be used as the primary generator.
- Birth-related factors may influence at most 15% of ranking.
- Do not infer or claim “喜用神”; only show calendar facts and element occurrence counts.
- Do not fabricate literary sources, duplicate-name rates, auspicious scores, or fate predictions.
- Unknown surname pronunciation lowers phonology confidence instead of inventing a pronunciation.
- No backend, account system, or upload of birth data in phase one.
- Root `index.html` must be self-contained and usable through HTML Preview.

---

### Task 1: Establish the build pipeline for a self-contained HTML app

**Files:**
- Modify: `package.json`
- Create: `scripts/build-single-html.mjs`
- Create: `src/template.html`
- Modify: `.github/workflows/test.yml`
- Test: `tests/build.test.js`

**Interfaces:**
- Consumes: `src/template.html`, `src/styles.css`, bundled `src/app.js`
- Produces: root `index.html`

- [ ] **Step 1: Write a failing build test**

Create `tests/build.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('root index is self-contained', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('<style>'));
  assert.ok(html.includes('<script>'));
  assert.ok(!html.includes('type="module"'));
  assert.ok(!html.includes('src="./src/'));
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
npm test -- tests/build.test.js
```

Expected: FAIL because current `index.html` loads external assets.

- [ ] **Step 3: Update package configuration**

Use:

```json
{
  "name": "haoming-dynamic-engine",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "build": "node scripts/build-single-html.mjs",
    "check": "npm test && npm run build && npm test"
  },
  "dependencies": {
    "lunar-javascript": "1.7.7"
  },
  "devDependencies": {
    "esbuild": "0.25.6"
  }
}
```

- [ ] **Step 4: Create the HTML template**

`src/template.html` must contain exact placeholders:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>好名有解｜动态宝宝取名</title>
  <style>__INLINE_CSS__</style>
</head>
<body>
  <div id="app"></div>
  <script>__INLINE_JS__</script>
</body>
</html>
```

- [ ] **Step 5: Implement the build script**

`scripts/build-single-html.mjs` must:

1. Bundle `src/app.js` as browser IIFE using esbuild.
2. Read `src/styles.css` and `src/template.html`.
3. Replace both placeholders.
4. Write root `index.html`.
5. Fail when either placeholder remains.

- [ ] **Step 6: Update CI**

The workflow must run:

```yaml
- run: npm ci
- run: npm run check
```

- [ ] **Step 7: Run verification and commit**

Run `npm run check`.
Expected: all tests pass and `index.html` is regenerated.

Commit:

```bash
git add package.json package-lock.json scripts src/template.html tests/build.test.js index.html .github/workflows/test.yml
git commit -m "build: add self-contained HTML pipeline"
```

---

### Task 2: Build the birth-profile and traditional-reference module

**Files:**
- Create: `src/calendar/birth-profile.js`
- Test: `tests/birth-profile.test.js`

**Interfaces:**
- Produces: `buildBirthProfile(input) -> BirthProfile`

```js
{
  localDateTime: '2026-07-14T19:20',
  timezone: '+09:00',
  lunarText: '...',
  pillars: { year, month, day, time },
  elementCounts: { 木, 火, 土, 金, 水 },
  seasonTags: string[],
  timeTags: string[],
  traditionalTags: string[],
  warnings: string[]
}
```

- [ ] **Step 1: Write failing tests**

Test cases:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBirthProfile } from '../src/calendar/birth-profile.js';

test('morning and night produce different time tags', () => {
  const morning = buildBirthProfile({ date: '2026-07-14', time: '06:30', timezone: '+09:00', enabled: true });
  const night = buildBirthProfile({ date: '2026-07-14', time: '22:30', timezone: '+09:00', enabled: true });
  assert.notDeepEqual(morning.timeTags, night.timeTags);
});

test('traditional mode exposes four pillars and five element counts', () => {
  const result = buildBirthProfile({ date: '2026-07-14', time: '19:20', timezone: '+09:00', enabled: true });
  assert.equal(Object.keys(result.pillars).length, 4);
  assert.equal(Object.keys(result.elementCounts).length, 5);
});

test('late zi hour includes a boundary warning', () => {
  const result = buildBirthProfile({ date: '2026-07-14', time: '23:30', timezone: '+09:00', enabled: true });
  assert.ok(result.warnings.some(item => item.includes('子时')));
});
```

- [ ] **Step 2: Verify tests fail**

Run `npm test -- tests/birth-profile.test.js`.
Expected: module not found.

- [ ] **Step 3: Implement deterministic calendar facts**

Implementation requirements:

- Parse the user-entered local date and local time without browser timezone conversion.
- Call `Solar.fromYmdHms(year, month, day, hour, minute, 0)`.
- Use `solar.getLunar().getEightChar()`.
- Read year, month, day and time pillars and each pillar’s Wu Xing string.
- Count each Chinese element character in the returned strings.
- Determine season from month and nearby solar-term information.
- Determine time tags from local clock ranges.
- Traditional tags must be weak semantic suggestions, not “补缺” commands.

- [ ] **Step 4: Run tests and commit**

Run `npm test -- tests/birth-profile.test.js`.
Expected: PASS.

Commit:

```bash
git add src/calendar/birth-profile.js tests/birth-profile.test.js
git commit -m "feat: derive birth profile and calendar facts"
```

---

### Task 3: Replace full-name data with character, relation, and template knowledge

**Files:**
- Replace: `src/data/names.js`
- Create: `src/data/characters.js`
- Create: `src/data/relations.js`
- Create: `src/data/templates.js`
- Modify: `src/data/surnames.js`
- Create: `src/data/maternal-symbols.js`
- Create: `src/data/risk-lexicon.js`
- Replace: `tests/data.test.js`

**Interfaces:**
- Produces: `CHARACTERS: CharacterFact[]`
- Produces: `RELATIONS: NameRelation[]`
- Produces: `TEMPLATES: NameTemplate[]`
- Produces: `SURNAME_PROFILES`
- Produces: `MATERNAL_SYMBOLS`
- Produces: `RISK_LEXICON`

- [ ] **Step 1: Write schema validation tests**

The test must require:

- At least 120 characters in the first implementation batch.
- Every character has `char`, `pinyin`, `tone`, `initial`, `final`, `roles`, `meanings`, `styles`, `commonness`, `writingEase`, `polyphonic`, and `riskTags`.
- At least 180 semantic relations.
- Every relation references existing characters and includes a non-empty explanation template.
- Every template references valid character roles.
- No relation contains a character marked `hard-block`.

- [ ] **Step 2: Verify failure**

Run `npm test -- tests/data.test.js`.

- [ ] **Step 3: Build the first audited data batch**

Use 120–180 common, name-suitable characters instead of attempting 500 unreviewed records in one pass. Include enough coverage for:

- wisdom and learning
- virtue and responsibility
- aspiration and direction
- calm and safety
- light and clarity
- growth and nature
- modern concise style
- traditional literary style
- male, female and neutral tendencies

`relations.js` must explicitly connect compatible character roles. A pair without a relation cannot become a final candidate.

- [ ] **Step 4: Add surname and maternal-symbol profiles**

Support at least 60 common surnames. Unknown surnames return a low-confidence profile.

Maternal symbols must be conservative and optional. Example:

```js
林: { tags: ['生长', '清润'], suggestedChars: ['嘉', '和', '清'] }
```

Do not map a surname when the mapping is forced or ambiguous.

- [ ] **Step 5: Run tests and commit**

Run `npm test -- tests/data.test.js`.
Expected: PASS.

Commit all data files.

---

### Task 4: Model a naming task from parents, surname mode, and constraints

**Files:**
- Create: `src/engine/task.js`
- Test: `tests/task.test.js`

**Interfaces:**
- Consumes: raw form values and `buildBirthProfile`
- Produces: `createNamingTask(input) -> NamingTask`

- [ ] **Step 1: Write failing tests**

Required behaviors:

- `surnameMode='father'` uses father surname.
- `surnameMode='mother'` uses mother surname.
- `surnameMode='double'` joins father then mother surname and defaults to one-character given names.
- `maternalMode='symbolic'` adds maternal tags but does not force the mother surname into the name.
- `maternalMode='direct'` fixes the first given-name character to the mother surname.
- Disabled traditional reference returns an empty birth influence object.

- [ ] **Step 2: Implement and verify**

Run `npm test -- tests/task.test.js`.
Expected: PASS.

- [ ] **Step 3: Commit**

Commit `src/engine/task.js` and tests.

---

### Task 5: Generate dynamic candidates from character roles and semantic relations

**Files:**
- Create: `src/engine/character-pool.js`
- Create: `src/engine/generate.js`
- Test: `tests/generate.test.js`

**Interfaces:**
- Produces: `buildCharacterPools(task) -> { first: WeightedCharacter[], second: WeightedCharacter[] }`
- Produces: `generateCandidates(task, options) -> Candidate[]`

- [ ] **Step 1: Write failing tests**

Tests must prove dynamic behavior:

```js
test('required character appears in every generated candidate', ...);
test('avoid characters never appear', ...);
test('mother symbolic mode changes candidate reasons', ...);
test('morning and night profiles produce different candidate sets', ...);
test('same input and seed are reproducible', ...);
test('different seed changes at least part of the candidate set', ...);
```

- [ ] **Step 2: Implement weighted character pools**

Weights may come from:

- user style and meaning
- gender tendency
- character position role
- birth season, time and traditional tags
- maternal symbolic tags
- popularity preference

Birth and family reference bonuses must be capped before candidate ranking.

- [ ] **Step 3: Implement relation-driven generation**

For two-character names:

1. Iterate valid templates.
2. Select characters that support required roles.
3. Require a matching semantic relation.
4. Produce explanation metadata from the relation.

For one-character names:

- Require `single` role.
- Apply stricter commonness and surname-sound rules.

- [ ] **Step 4: Run tests and commit**

Run `npm test -- tests/generate.test.js`.
Expected: PASS.

---

### Task 6: Add full-name phonology, semantic, and risk review

**Files:**
- Replace: `src/engine/phonology.js`
- Create: `src/engine/semantics.js`
- Replace: `src/engine/risk.js`
- Test: `tests/review.test.js`

**Interfaces:**
- Produces: `reviewPhonology(fullName, surnameProfile, candidate) -> Review`
- Produces: `reviewSemantics(candidate) -> Review`
- Produces: `reviewRisks(task, candidate) -> Review`

- [ ] **Step 1: Write failing tests**

Cover:

- surname and first given character same syllable
- three identical tones
- repeated initial or final penalties
- explicit bad phrase blocking
- custom family taboo blocking
- unknown surname pronunciation yields warning, not fake certainty
- relation-backed candidate passes semantic review
- candidate without relation metadata fails semantic review

- [ ] **Step 2: Implement hard and soft outcomes**

Review output:

```js
{
  passed: true,
  score: 0,
  hardRisks: [],
  warnings: [],
  evidence: []
}
```

Hard risks remove candidates; warnings reduce ranking and appear in output.

- [ ] **Step 3: Run tests and commit**

Run `npm test -- tests/review.test.js`.
Expected: PASS.

---

### Task 7: Rank, diversify, and explain candidates without fake public scores

**Files:**
- Replace: `src/engine/score.js`
- Replace: `src/engine/recommend.js`
- Create: `src/engine/explain.js`
- Test: `tests/rank.test.js`

**Interfaces:**
- Produces: `rankCandidates(task, reviewedCandidates) -> RankedCandidate[]`
- Produces: `selectRecommendations(ranked, limit = 8) -> Recommendation[]`
- Produces: `explainRecommendation(task, recommendation) -> Explanation`

- [ ] **Step 1: Write failing tests**

Tests must verify:

- naturalness, phonology and semantics dominate birth influence
- birth influence is capped at 15%
- selected recommendations are diverse by template and first character
- no category is filled with a failing candidate
- explanation states whether birth and mother surname affected the result
- missing source is rendered as “无直接可靠出处”

- [ ] **Step 2: Implement exact ranking weights**

Use the weights from the design spec. Keep internal numeric scores, but map public output to:

- `strong`
- `consider`
- `explore`

- [ ] **Step 3: Implement explanation evidence**

Explanation must be assembled from structured metadata, not generated free-form.

- [ ] **Step 4: Run tests and commit**

Run `npm test -- tests/rank.test.js`.
Expected: PASS.

---

### Task 8: Build the multi-step user interface

**Files:**
- Replace: `src/app.js`
- Replace: `src/styles.css`
- Modify: `src/template.html`
- Replace: `tests/ui-smoke.test.js`

**Interfaces:**
- UI creates `NamingTask`, generates, reviews, ranks, and renders recommendations.

- [ ] **Step 1: Write a failing UI smoke test**

The built `index.html` must expose these IDs:

```text
father-surname
mother-surname
surname-mode
birth-date
birth-time
timezone
traditional-reference
maternal-mode
gender
name-length
style
meaning
required-char
avoid-chars
custom-taboos
generate
recommendations
birth-summary
```

- [ ] **Step 2: Implement a three-step wizard**

1. Family and surname.
2. Birth information and traditional-reference toggle.
3. Naming preferences and constraints.

Result cards show:

- full name and pinyin
- recommendation level
- complete semantic explanation
- surname pronunciation conclusion
- birth contribution
- mother-surname contribution
- source status
- warnings
- feedback buttons

- [ ] **Step 3: Add local feedback**

Feedback modifies only the active task and persists under `localStorage` key `haoming.dynamic.preference.v1`.

- [ ] **Step 4: Build and manually verify mobile behavior**

Run:

```bash
npm run build
python3 -m http.server 8000
```

Verify at 360px width:

- no horizontal scroll
- all required inputs usable
- generated cards readable
- “换一批” changes results
- feedback reranks results

- [ ] **Step 5: Commit**

Commit UI, styles, template and smoke test.

---

### Task 9: Add integration tests proving the engine is genuinely dynamic

**Files:**
- Create: `tests/integration.test.js`
- Modify: `README.md`
- Modify: `.github/workflows/test.yml`

**Interfaces:**
- Verifies the completed public behavior.

- [ ] **Step 1: Add integration scenarios**

Scenarios:

1. `陈 + 林 + 2026-07-14 06:30` versus the same inputs at `22:30` must differ in birth route and at least two recommendations.
2. Changing child surname from 陈 to 林 must change phonology ranking and at least half of the final list.
3. Maternal mode off versus symbolic must change explanation metadata and at least one recommendation.
4. Required character appears in every result.
5. Avoided character appears in none.
6. No result lacks relation metadata.
7. Rebuilding twice produces byte-identical `index.html`.

- [ ] **Step 2: Update documentation**

README must explain:

- dynamic generation architecture
- traditional-reference limitations
- local privacy behavior
- build and test commands
- why output changes when parents, birth time or constraints change

- [ ] **Step 3: Run full verification**

Run:

```bash
npm ci
npm run check
```

Expected:

- all tests pass
- build succeeds
- second test pass confirms generated `index.html`

- [ ] **Step 4: Open PR only after CI passes**

PR body must include test count, build result, known limits, and a preview link.
