import { NotUndefinedRule } from './not-undefined.rule';

describe('NotUndefinedRule', () => {
  const rule = new NotUndefinedRule();

  it('expõe o errorCode "not.undefined"', () => {
    expect(rule.errorCode).toBe('not.undefined');
  });

  it.each([[null], [0], ['']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[undefined]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('not.undefined');
  });
});
