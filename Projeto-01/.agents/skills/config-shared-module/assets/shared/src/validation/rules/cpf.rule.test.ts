import { CpfRule } from './cpf.rule';

describe('CpfRule', () => {
  const rule = new CpfRule();

  it('expõe o errorCode "invalid.cpf"', () => {
    expect(rule.errorCode).toBe('invalid.cpf');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['529.982.247-25'], ['52998224725'], ['100.000.063-00'], ['10000002810']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['529.982.247-26'], ['529.982.247-35'], ['111.111.111-11'], ['1234'], [52998224725]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.cpf');
  });
});
