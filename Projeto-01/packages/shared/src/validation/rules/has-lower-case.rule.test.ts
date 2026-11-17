import { HasLowerCaseRule } from './has-lower-case.rule';

describe('HasLowerCaseRule', () => {
  const rule = new HasLowerCaseRule();

  it('expõe o errorCode "has.lower.case"', () => {
    expect(rule.errorCode).toBe('has.lower.case');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ABc']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ABC'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('has.lower.case');
  });
});
