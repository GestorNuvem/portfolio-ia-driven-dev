import { DateRangeRule } from './date-range.rule';

describe('DateRangeRule', () => {
  const rule = new DateRangeRule('2024-01-01', '2024-12-31');

  it('expõe o errorCode "date.range"', () => {
    expect(rule.errorCode).toBe('date.range');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-01-01'], ['2024-12-31'], ['2024-06-01']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2023-12-31'], ['2025-01-01'], ['abc']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('date.range');
  });
});
