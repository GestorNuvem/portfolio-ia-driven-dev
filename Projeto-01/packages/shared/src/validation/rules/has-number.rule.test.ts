import { HasNumberRule } from './has-number.rule';

describe('HasNumberRule', () => {
  const rule = new HasNumberRule();

  it('expõe o errorCode "has.number"', () => {
    expect(rule.errorCode).toBe('has.number');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ab1']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('has.number');
  });
});
