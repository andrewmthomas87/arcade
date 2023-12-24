import { shuffleArrayDurstenfeld } from './shuffle';

export function sampleNRandomInts(
  n: number,
  min: number,
  max: number,
  excluded: Set<number> = new Set(),
) {
  const selected = new Set<number>();
  for (let i = 0; selected.size < n && i < n * 100; i++) {
    const r = Math.trunc(Math.random() * (max - min) + min);
    if (!excluded.has(r)) {
      selected.add(r);
    }
  }

  if (selected.size !== n) {
    throw new Error('failed to sample random ints');
  }

  const arr = Array.from(selected);
  shuffleArrayDurstenfeld(arr);

  return arr;
}
