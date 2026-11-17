import { EmailRule } from './email.rule';

describe('EmailRule', () => {
  const rule = new EmailRule();

  it('expõe o errorCode "invalid.email"', () => {
    expect(rule.errorCode).toBe('invalid.email');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['user@mail.com'], ['a.b+c@x.com.br']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['user'], ['user@mail'], ['a b@x.com'], [123]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.email');
  });
});
