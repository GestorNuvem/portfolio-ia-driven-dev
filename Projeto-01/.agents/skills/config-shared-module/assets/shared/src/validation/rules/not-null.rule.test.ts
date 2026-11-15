import { NotNullRule } from './not-null.rule';

describe('NotNullRule', () => {
  const rule = new NotNullRule();

  it('expõe o errorCode "not.null"', () => {
    expect(rule.errorCode).toBe('not.null');
  });

  it.each([[undefined], [0], ['']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[null]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('not.null');
  });
});
