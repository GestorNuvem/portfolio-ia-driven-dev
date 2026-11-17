import { MaxItemsRule } from './max-items.rule';

describe('MaxItemsRule', () => {
  const rule = new MaxItemsRule(2);

  it('expõe o errorCode "max.items"', () => {
    expect(rule.errorCode).toBe('max.items');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[[]], [[1, 2]]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[[1, 2, 3]], ['a']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('max.items');
  });
});
