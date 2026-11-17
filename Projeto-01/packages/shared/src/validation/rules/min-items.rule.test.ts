import { MinItemsRule } from './min-items.rule';

describe('MinItemsRule', () => {
  const rule = new MinItemsRule(2);

  it('expõe o errorCode "min.items"', () => {
    expect(rule.errorCode).toBe('min.items');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[[1, 2]]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[[1]], ['ab']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('min.items');
  });
});
