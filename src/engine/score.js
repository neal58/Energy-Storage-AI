const clamp = value => Math.max(0, Math.min(100, value));

export function scoreCandidate(candidate, context = {}) {
  const pattern = [context.surnameTone, ...(candidate.tones ?? [])];
  let pronunciation = 80;
  if ((context.preferredTonePatterns ?? []).some(p => JSON.stringify(p) === JSON.stringify(pattern))) pronunciation += 15;
  for (let i = 0; i < pattern.length - 1; i++) {
    if (pattern[i] && pattern[i] === pattern[i + 1]) pronunciation -= 10;
  }
  pronunciation = clamp(pronunciation);

  const naturalness = clamp(candidate.naturalness ?? 0);
  const semantics = clamp(candidate.semanticCoherence ?? 0);
  const growthFit = clamp(candidate.growthFit ?? 0);
  const usability = clamp(candidate.writingEase ?? 0);
  let surnameFit = 75;
  for (const style of candidate.styles ?? []) surnameFit += (context.stylePreferences?.[style] ?? 0) * 4;
  for (const meaning of candidate.meanings ?? []) surnameFit += (context.meaningPreferences?.[meaning] ?? 0) * 3;
  surnameFit = clamp(surnameFit);

  const total = Math.round(
    naturalness * 0.30 +
    pronunciation * 0.25 +
    semantics * 0.15 +
    surnameFit * 0.10 +
    growthFit * 0.10 +
    usability * 0.10
  );

  return { total, naturalness, pronunciation, semantics, surnameFit, growthFit, usability };
}
