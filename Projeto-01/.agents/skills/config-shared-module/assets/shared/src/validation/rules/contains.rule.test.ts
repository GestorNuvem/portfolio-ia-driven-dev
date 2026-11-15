import { ContainsRule } from './contains.rule';

describe('ContainsRule', () => {
  const rule = new ContainsRule('mid');

  it('expõe o errorCode "contains"', () => {
    expect(rule.errorCode).toBe('contains');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['a-mid-b']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('contains');
  });
});
