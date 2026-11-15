import { MinDateRule } from './min-date.rule';

describe('MinDateRule', () => {
  const rule = new MinDateRule('2024-01-01');

  it('expõe o errorCode "min.date"', () => {
    expect(rule.errorCode).toBe('min.date');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-01-01'], [new Date('2025-01-01')]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2023-12-31'], ['abc']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('min.date');
  });
});
