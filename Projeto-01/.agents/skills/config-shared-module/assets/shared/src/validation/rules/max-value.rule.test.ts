import { MaxValueRule } from './max-value.rule';

describe('MaxValueRule', () => {
  const rule = new MaxValueRule(10);

  it('expõe o errorCode "max.value"', () => {
    expect(rule.errorCode).toBe('max.value');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[10], [-5]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[10.01], ['1'], [NaN]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('max.value');
  });
});
