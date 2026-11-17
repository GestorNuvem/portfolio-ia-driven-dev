import { CnpjRule } from './cnpj.rule';

describe('CnpjRule', () => {
  const rule = new CnpjRule();

  it('expõe o errorCode "invalid.cnpj"', () => {
    expect(rule.errorCode).toBe('invalid.cnpj');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['11.222.333/0001-81'], ['11222333000181'], ['11.222.333/0005-05'], ['11222333001820']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['11.222.333/0001-91'], ['11.222.333/0001-82'], ['00.000.000/0000-00'], ['1234'], [11222333000181]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.cnpj');
  });
});
