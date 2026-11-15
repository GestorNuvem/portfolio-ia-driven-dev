import { NoCommonPasswordRule } from './no-common-password.rule';

describe('NoCommonPasswordRule', () => {
  const rule = new NoCommonPasswordRule();

  it('expõe o errorCode "common.password"', () => {
    expect(rule.errorCode).toBe('common.password');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['Xk9#mP2q']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['123456'], ['PASSWORD'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('common.password');
  });

  it('aceita lista negra customizada', () => {
    const custom = new NoCommonPasswordRule(['Empresa2024']);
    expect(custom.validate('empresa2024')).toBe('common.password');
    expect(custom.validate('123456')).toBeNull();
  });
});
