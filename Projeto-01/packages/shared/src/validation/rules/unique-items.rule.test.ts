import { UniqueItemsRule } from './unique-items.rule';

describe('UniqueItemsRule', () => {
  const rule = new UniqueItemsRule();

  it('expõe o errorCode "unique.items"', () => {
    expect(rule.errorCode).toBe('unique.items');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[[1, 2, 3]], [[{ a: 1 }, { a: 2 }]]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[[1, 2, 1]], [[{ a: 1 }, { a: 1 }]], ['abc']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('unique.items');
  });
});
