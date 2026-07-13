export function detectFullNameRisks(surname, candidate, surnameRule = {}) {
  const fullName = `${surname}${candidate.name}`;
  const risks = [];
  for (const pattern of surnameRule.avoidFullNamePatterns ?? []) {
    if (fullName.includes(pattern)) risks.push('surname-pattern');
  }
  if (candidate.risks?.length) risks.push(...candidate.risks);
  return [...new Set(risks)];
}
