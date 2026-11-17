import { HexColorRule } from './hex-color.rule';

describe('HexColorRule', () => {
  const rule = new HexColorRule();

  it('expõe o errorCode "hex.color"', () => {
    expect(rule.errorCode).toBe('hex.color');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['#FFF'], ['#a1b2c3']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['FFF'], ['#FFFF'], ['#GGG'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('hex.color');
  });
});
