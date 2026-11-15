import { DateStringRule } from './date-string.rule';

describe('DateStringRule', () => {
  const rule = new DateStringRule();

  it('expõe o errorCode "date.string"', () => {
    expect(rule.errorCode).toBe('date.string');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-02-29'], ['2024-01-31T10:20'], ['2024-01-31T10:20:30.123Z'], ['2024-01-31T10:20:30-03:00']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2023-02-29'], ['2024-13-01'], ['31/01/2024'], ['2024-01-31T25:00'], [20240131]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('date.string');
  });
});
