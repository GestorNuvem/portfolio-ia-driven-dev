import { NegativeRule } from './negative.rule';

describe('NegativeRule', () => {
  const rule = new NegativeRule();

  it('expõe o errorCode "negative"', () => {
    expect(rule.errorCode).toBe('negative');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[-0.1], [-5]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[0], [1], ['-1']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('negative');
  });
});
