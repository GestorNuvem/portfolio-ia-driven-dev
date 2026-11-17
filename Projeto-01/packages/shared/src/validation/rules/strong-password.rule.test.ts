import { StrongPasswordRule } from './strong-password.rule';

describe('StrongPasswordRule', () => {
  const rule = new StrongPasswordRule();

  it('expõe o errorCode "strong.password"', () => {
    expect(rule.errorCode).toBe('strong.password');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['Abcdef1!']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['Ab1!'], ['abcdef1!'], ['ABCDEF1!'], ['Abcdefg!'], ['Abcdefg1'], [12345678]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('strong.password');
  });

  it('aceita tamanho mínimo customizado', () => {
    expect(new StrongPasswordRule(12).validate('Abcdef1!')).toBe('strong.password');
    expect(new StrongPasswordRule(4).validate('Ab1!')).toBeNull();
  });
});
