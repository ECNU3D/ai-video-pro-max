import { describe, it, expect } from 'vitest';
import { PALETTE, colorForIndex } from '../src/data/palette';

describe('palette', () => {
  it('assigns distinct colors for the first several indices', () => {
    const colors = [0, 1, 2, 3].map(colorForIndex);
    expect(new Set(colors).size).toBe(4);
  });

  it('wraps around past the palette length', () => {
    expect(colorForIndex(PALETTE.length)).toBe(PALETTE[0]);
    expect(colorForIndex(PALETTE.length + 2)).toBe(PALETTE[2]);
  });
});
