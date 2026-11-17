import { RangeLengthRule } from './range-length.rule';

describe('RangeLengthRule', () => {
  const rule = new RangeLengthRule(2, 4);

  it('expõe o errorCode "range.length"', () => {
    expect(rule.errorCode).toBe('range.length');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ab'], ['abcd'], [[1, 2, 3]]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['a'], ['abcde'], [123]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('range.length');
  });
});
