import { PositiveRule } from './positive.rule';

describe('PositiveRule', () => {
  const rule = new PositiveRule();

  it('expõe o errorCode "positive"', () => {
    expect(rule.errorCode).toBe('positive');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[0.1], [5]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[0], [-1], ['1']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('positive');
  });
});
