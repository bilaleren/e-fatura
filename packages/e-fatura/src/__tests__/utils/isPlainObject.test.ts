import { it, expect, describe } from 'vitest';
import isPlainObject from '../../utils/isPlainObject';

describe('isPlainObject()', () => {
  it.each([{}, { x: 1 }])('"%p" düz bir obje olmalı.', (value) => {
    expect(isPlainObject(value)).toBe(true);
  });

  it.each([0, 1, true, false, '', 'plain', []])(
    '"%p" düz bir obje olmamalı.',
    (value) => {
      expect(isPlainObject(value)).toBe(false);
    }
  );
});
