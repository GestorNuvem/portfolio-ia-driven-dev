import { RequiredRule } from './required.rule';

describe('RequiredRule', () => {
  const rule = new RequiredRule();

  it('expõe o errorCode "required"', () => {
    expect(rule.errorCode).toBe('required');
  });

  it.each([['a'], [0], [false], [[1]], [{}]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[null], [undefined], [''], ['   '], [[]]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('required');
  });
});
