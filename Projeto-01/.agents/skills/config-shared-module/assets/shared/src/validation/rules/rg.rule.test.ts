import { RgRule } from './rg.rule';

describe('RgRule', () => {
  const rule = new RgRule();

  it('expõe o errorCode "invalid.rg"', () => {
    expect(rule.errorCode).toBe('invalid.rg');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['12.345.678-9'], ['123456789'], ['1.234.567-X']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['12.345.678-AB'], ['123'], [123456789]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.rg');
  });
});
