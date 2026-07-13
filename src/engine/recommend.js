const slotMatchers = {
  best: () => true,
  safe: candidate => (candidate.rarity ?? 50) <= 55,
  rare: candidate => (candidate.rarity ?? 0) >= 70,
  cultural: candidate => candidate.sourceVerified === true,
  modern: candidate => (candidate.styles ?? []).includes('现代'),
  explore: () => true
};

export function recommendNames(candidates, context = {}, limit = 6) {
  const sorted = [...candidates].sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0));
  const slots = ['best', 'safe', 'rare', 'cultural', 'modern', 'explore'].slice(0, limit);
  const used = new Set();
  const result = [];

  for (const slot of slots) {
    let candidate = sorted.find(item => !used.has(item.name) && slotMatchers[slot](item));
    if (!candidate) candidate = sorted.find(item => !used.has(item.name));
    if (!candidate) break;
    used.add(candidate.name);
    result.push({ ...candidate, slot });
  }

  return result;
}
