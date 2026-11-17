import { StartsWithRule } from './starts-with.rule';

describe('StartsWithRule', () => {
  const rule = new StartsWithRule('pre');

  it('expõe o errorCode "starts.with"', () => {
    expect(rule.errorCode).toBe('starts.with');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['prefix']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['xpre'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('starts.with');
  });
});
