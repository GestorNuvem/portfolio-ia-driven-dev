import { MinLengthRule } from './min-length.rule';

describe('MinLengthRule', () => {
  const rule = new MinLengthRule(3);

  it('expõe o errorCode "min.length"', () => {
    expect(rule.errorCode).toBe('min.length');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc'], [[1, 2, 3, 4]]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ab'], [[1]], [123]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('min.length');
  });
});
