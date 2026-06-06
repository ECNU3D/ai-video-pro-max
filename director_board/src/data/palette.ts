/** Distinct, easily-distinguishable colors assigned to characters in order. */
export const PALETTE = [
  '#e6194b', // red
  '#3cb44b', // green
  '#4363d8', // blue
  '#f58231', // orange
  '#911eb4', // purple
  '#42d4f4', // cyan
  '#f032e6', // magenta
  '#bfef45', // lime
  '#fabed4', // pink
  '#469990', // teal
] as const;

/** Returns a palette color for the given index, wrapping around. */
export function colorForIndex(index: number): string {
  return PALETTE[index % PALETTE.length];
}
