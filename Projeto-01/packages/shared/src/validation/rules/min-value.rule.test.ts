import { MinValueRule } from './min-value.rule';

describe('MinValueRule', () => {
  const rule = new MinValueRule(10);

  it('expõe o errorCode "min.value"', () => {
    expect(rule.errorCode).toBe('min.value');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[10], [11.5]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[9.99], ['10'], [NaN]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('min.value');
  });
});
