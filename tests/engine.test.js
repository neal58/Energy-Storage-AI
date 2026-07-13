import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCandidates } from '../src/engine/filter.js';
import { detectFullNameRisks } from '../src/engine/risk.js';
import { scoreCandidate } from '../src/engine/score.js';
import { recommendNames } from '../src/engine/recommend.js';
import { applyFeedback } from '../src/engine/feedback.js';

test('filters polyphonic, avoided and risky candidates', () => {
  const candidates = [
    { name: '清和', chars: ['清', '和'], risks: [], polyphonic: false },
    { name: '行远', chars: ['行', '远'], risks: [], polyphonic: true },
    { name: '梓轩', chars: ['梓', '轩'], risks: ['avoid'], polyphonic: false }
  ];
  const result = filterCandidates(candidates, { avoidChars: ['梓'], allowPolyphonic: false });
  assert.deepEqual(result.map(item => item.name), ['清和']);
});

test('detects surname-specific pattern risk', () => {
  const risks = detectFullNameRisks('林', { name: '霖安', chars: ['霖', '安'] }, { avoidFullNamePatterns: ['林霖'] });
  assert.ok(risks.includes('surname-pattern'));
});

test('returns weighted explainable score', () => {
  const candidate = {
    naturalness: 92,
    semanticCoherence: 94,
    growthFit: 95,
    writingEase: 90,
    tones: [1, 3],
    styles: ['温润'],
    meanings: ['智慧']
  };
  const result = scoreCandidate(candidate, {
    surnameTone: 2,
    preferredTonePatterns: [[2, 1, 3]],
    stylePreferences: { 温润: 2 },
    meaningPreferences: { 智慧: 1 }
  });
  assert.ok(result.total >= 85);
  assert.equal(Object.keys(result).length, 7);
});

test('returns six unique recommendation slots', () => {
  const candidates = Array.from({ length: 10 }, (_, index) => ({
    name: `名字${index}`,
    styles: [index % 2 ? '现代' : '古典'],
    sourceVerified: index % 3 === 0,
    rarity: index * 10,
    score: { total: 90 - index }
  }));
  const result = recommendNames(candidates, {}, 6);
  assert.equal(result.length, 6);
  assert.equal(new Set(result.map(item => item.name)).size, 6);
  assert.deepEqual(result.map(item => item.slot), ['best', 'safe', 'rare', 'cultural', 'modern', 'explore']);
});

test('feedback updates preferences immutably', () => {
  const profile = {};
  const candidate = { styles: ['古典'], meanings: ['智慧'] };
  const result = applyFeedback(profile, candidate, 'like');
  assert.equal(result.styles.古典, 2);
  assert.equal(result.meanings.智慧, 2);
  assert.deepEqual(profile, {});
});
