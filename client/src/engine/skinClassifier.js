/**
 * Rule-based skin tone classification using LAB color space.
 *
 * | Tone   | L range      | Notes                         |
 * |--------|------------- |-------------------------------|
 * | Fair   | L > 70       | Low a, low b                  |
 * | Medium | 55 < L ≤ 70  | Moderate a and b              |
 * | Olive  | 40 < L ≤ 55  | Low a, higher b (yellow-ish)  |
 * | Deep   | L ≤ 40       | Any a/b                       |
 */

export function classifySkinTone(lab) {
  const { L, a, b } = lab;

  if (L > 70) return "Fair";
  if (L > 55) return "Medium";
  if (L > 40) {
    // Olive has lower redness (a) and higher yellowness (b)
    if (b > 15 && a < 15) return "Olive";
    return "Medium";
  }
  return "Deep";
}

export function getUndertone(lab) {
  const { a, b } = lab;
  if (a > 12 && b < 18) return "Cool";
  if (a < 10 && b > 20) return "Warm";
  return "Neutral";
}

export function classifyDetailed(lab) {
  return {
    tone: classifySkinTone(lab),
    undertone: getUndertone(lab),
    lab: { L: lab.L, a: lab.a, b: lab.b },
  };
}
