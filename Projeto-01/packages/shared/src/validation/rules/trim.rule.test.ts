import { TrimRule } from './trim.rule';

describe('TrimRule', () => {
  const rule = new TrimRule();

  it('expõe o errorCode "trim"', () => {
    expect(rule.errorCode).toBe('trim');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc'], ['a b']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[' abc'], ['abc '], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('trim');
  });
});
