import { DateRule } from './date.rule';

describe('DateRule', () => {
  const rule = new DateRule();

  it('expõe o errorCode "invalid.date"', () => {
    expect(rule.errorCode).toBe('invalid.date');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[new Date()], ['2024-01-31'], [0]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc'], [new Date('x')], [{}]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.date');
  });
});
