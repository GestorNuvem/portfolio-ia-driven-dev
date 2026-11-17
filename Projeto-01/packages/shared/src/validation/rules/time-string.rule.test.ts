import { TimeStringRule } from './time-string.rule';

describe('TimeStringRule', () => {
  const rule = new TimeStringRule();

  it('expõe o errorCode "time.string"', () => {
    expect(rule.errorCode).toBe('time.string');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['00:00'], ['23:59'], ['12:30:45']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['24:00'], ['12:60'], ['1:30'], ['12:30:60'], [1230]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('time.string');
  });
});
