import { NoWhitespaceRule } from './no-whitespace.rule';

describe('NoWhitespaceRule', () => {
  const rule = new NoWhitespaceRule();

  it('expõe o errorCode "no.whitespace"', () => {
    expect(rule.errorCode).toBe('no.whitespace');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['a b'], ['a\tb'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('no.whitespace');
  });
});
