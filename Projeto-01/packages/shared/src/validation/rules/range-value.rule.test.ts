import { RangeValueRule } from './range-value.rule';

describe('RangeValueRule', () => {
  const rule = new RangeValueRule(1, 10);

  it('expõe o errorCode "range.value"', () => {
    expect(rule.errorCode).toBe('range.value');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[1], [10], [5.5]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[0], [11], ['5']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('range.value');
  });
});
