import { detectFullNameRisks } from './risk.js';

export function filterCandidates(candidates, input = {}) {
  const avoid = new Set(input.avoidChars ?? []);
  return candidates.filter(candidate => {
    if (!input.allowPolyphonic && candidate.polyphonic) return false;
    if (candidate.chars?.some(char => avoid.has(char))) return false;
    const risks = detectFullNameRisks(input.surname ?? '', candidate, input.surnameRule ?? {});
    return risks.length === 0;
  });
}
