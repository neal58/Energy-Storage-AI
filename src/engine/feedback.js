const clone = profile => ({
  styles: { ...(profile.styles ?? {}) },
  meanings: { ...(profile.meanings ?? {}) },
  rarity: profile.rarity ?? 0,
  pronunciation: profile.pronunciation ?? 0,
  writingEase: profile.writingEase ?? 0,
  semanticCoherence: profile.semanticCoherence ?? 0
});

const bump = (object, key, delta) => {
  object[key] = (object[key] ?? 0) + delta;
};

export function applyFeedback(profile, candidate, feedbackType) {
  const next = clone(profile);

  if (feedbackType === 'like') {
    for (const style of candidate.styles ?? []) bump(next.styles, style, 2);
    for (const meaning of candidate.meanings ?? []) bump(next.meanings, meaning, 2);
  } else if (feedbackType === 'too-common') {
    next.rarity += 2;
  } else if (feedbackType === 'too-traditional') {
    bump(next.styles, '古典', -2);
  } else if (feedbackType === 'bad-sound') {
    next.pronunciation += 2;
  } else if (feedbackType === 'too-complex') {
    next.writingEase += 3;
  } else if (feedbackType === 'bad-meaning') {
    next.semanticCoherence += 2;
  }

  return next;
}
