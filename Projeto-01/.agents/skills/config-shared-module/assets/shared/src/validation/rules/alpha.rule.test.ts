import { AlphaRule } from './alpha.rule';

describe('AlphaRule', () => {
  const rule = new AlphaRule();

  it('expõe o errorCode "alpha"', () => {
    expect(rule.errorCode).toBe('alpha');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abcXYZ']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc1'], ['a b'], [''], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('alpha');
  });
});
