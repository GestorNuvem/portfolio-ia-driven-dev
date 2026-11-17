import { InRule } from './in.rule';

describe('InRule', () => {
  const rule = new InRule(['a', 'b', 1]);

  it('expõe o errorCode "in"', () => {
    expect(rule.errorCode).toBe('in');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['a'], [1], [['a', 'b']]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['c'], [['a', 'c']]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('in');
  });
});
