import { MaxLengthRule } from './max-length.rule';

describe('MaxLengthRule', () => {
  const rule = new MaxLengthRule(3);

  it('expõe o errorCode "max.length"', () => {
    expect(rule.errorCode).toBe('max.length');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc'], [[]]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abcd'], [[1, 2, 3, 4]], [123]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('max.length');
  });
});
