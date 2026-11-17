import { UpperCaseRule } from './upper-case.rule';

describe('UpperCaseRule', () => {
  const rule = new UpperCaseRule();

  it('expõe o errorCode "upper.case"', () => {
    expect(rule.errorCode).toBe('upper.case');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ABC'], ['ABC 1']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['AbC'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('upper.case');
  });
});
