import { HasSpecialCharRule } from './has-special-char.rule';

describe('HasSpecialCharRule', () => {
  const rule = new HasSpecialCharRule();

  it('expõe o errorCode "has.special.char"', () => {
    expect(rule.errorCode).toBe('has.special.char');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ab!'], ['a@b']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ab c1'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('has.special.char');
  });
});
