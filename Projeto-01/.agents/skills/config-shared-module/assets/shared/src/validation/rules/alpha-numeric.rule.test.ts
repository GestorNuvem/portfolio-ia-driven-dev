import { AlphaNumericRule } from './alpha-numeric.rule';

describe('AlphaNumericRule', () => {
  const rule = new AlphaNumericRule();

  it('expõe o errorCode "alpha.numeric"', () => {
    expect(rule.errorCode).toBe('alpha.numeric');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc123']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc-1'], [''], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('alpha.numeric');
  });
});
