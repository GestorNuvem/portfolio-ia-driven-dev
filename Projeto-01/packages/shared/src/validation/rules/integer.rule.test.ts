import { IntegerRule } from './integer.rule';

describe('IntegerRule', () => {
  const rule = new IntegerRule();

  it('expõe o errorCode "integer"', () => {
    expect(rule.errorCode).toBe('integer');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[1], [-3], [0]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[1.5], ['1'], [NaN]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('integer');
  });
});
