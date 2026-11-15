import { LowerCaseRule } from './lower-case.rule';

describe('LowerCaseRule', () => {
  const rule = new LowerCaseRule();

  it('expõe o errorCode "lower.case"', () => {
    expect(rule.errorCode).toBe('lower.case');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc'], ['abc 1']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['aBc'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('lower.case');
  });
});
