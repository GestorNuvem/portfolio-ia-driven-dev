import { HasUpperCaseRule } from './has-upper-case.rule';

describe('HasUpperCaseRule', () => {
  const rule = new HasUpperCaseRule();

  it('expõe o errorCode "has.upper.case"', () => {
    expect(rule.errorCode).toBe('has.upper.case');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abC']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('has.upper.case');
  });
});
