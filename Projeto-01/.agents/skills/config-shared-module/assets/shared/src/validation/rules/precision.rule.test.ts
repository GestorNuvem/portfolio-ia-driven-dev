import { PrecisionRule } from './precision.rule';

describe('PrecisionRule', () => {
  const rule = new PrecisionRule(2);

  it('expõe o errorCode "precision"', () => {
    expect(rule.errorCode).toBe('precision');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[1], [1.2], [1.23], [-0.5]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[1.234], [0.1 + 0.2], [Infinity], ['1.2']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('precision');
  });
});
