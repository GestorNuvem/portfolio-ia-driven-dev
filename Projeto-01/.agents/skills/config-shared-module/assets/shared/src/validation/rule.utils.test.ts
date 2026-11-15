import { isEqual, isNullish, isNumber, isString, lengthOf, matches, onlyDigits, toDate } from './rule.utils';

describe('rule.utils', () => {
  it('isNullish', () => {
    expect(isNullish(null)).toBe(true);
    expect(isNullish(undefined)).toBe(true);
    expect(isNullish(0)).toBe(false);
  });

  it('isString / isNumber', () => {
    expect(isString('a')).toBe(true);
    expect(isString(1)).toBe(false);
    expect(isNumber(1)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber('1')).toBe(false);
  });

  it('lengthOf', () => {
    expect(lengthOf('abc')).toBe(3);
    expect(lengthOf([1, 2])).toBe(2);
    expect(lengthOf(10)).toBeNull();
  });

  it('toDate', () => {
    const now = new Date();
    expect(toDate(now)).toBe(now);
    expect(toDate('2024-01-01')?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(toDate(0)?.getTime()).toBe(0);
    expect(toDate('abc')).toBeNull();
    expect(toDate({})).toBeNull();
  });

  it('matches / onlyDigits', () => {
    expect(matches('abc', /^a/)).toBe(true);
    expect(matches(1, /1/)).toBe(false);
    expect(onlyDigits('529.982.247-25')).toBe('52998224725');
  });

  it('isEqual', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual(NaN, NaN)).toBe(true);
    expect(isEqual(new Date(1), new Date(1))).toBe(true);
    expect(isEqual(new Date(1), new Date(2))).toBe(false);
    expect(isEqual(1, '1')).toBe(false);
    expect(isEqual(null, {})).toBe(false);
    expect(isEqual({}, null)).toBe(false);
    expect(isEqual([], {})).toBe(false);
    expect(isEqual([1, 2], [1, 2])).toBe(true);
    expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(isEqual({ a: { b: [1] } }, { a: { b: [1] } })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
  });
});
