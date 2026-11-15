import { CepRule } from './cep.rule';

describe('CepRule', () => {
  const rule = new CepRule();

  it('expõe o errorCode "invalid.cep"', () => {
    expect(rule.errorCode).toBe('invalid.cep');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['01001-000']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['01001000'], ['0100-000'], [1001000]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.cep');
  });
});
