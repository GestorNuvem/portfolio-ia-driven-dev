import { MaxDateRule } from './max-date.rule';

describe('MaxDateRule', () => {
  const rule = new MaxDateRule('2024-01-01');

  it('expõe o errorCode "max.date"', () => {
    expect(rule.errorCode).toBe('max.date');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-01-01'], ['2020-05-05']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-01-02'], ['abc']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('max.date');
  });
});
