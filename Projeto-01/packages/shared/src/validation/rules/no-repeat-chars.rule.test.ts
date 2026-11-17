import { NoRepeatCharsRule } from './no-repeat-chars.rule';

describe('NoRepeatCharsRule', () => {
  const rule = new NoRepeatCharsRule();

  it('expõe o errorCode "repeat.chars"', () => {
    expect(rule.errorCode).toBe('repeat.chars');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['aabbcc'], ['abc']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['aaa'], ['x111y'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('repeat.chars');
  });

  it('aceita máximo de repetições customizado', () => {
    expect(new NoRepeatCharsRule(1).validate('aab')).toBe('repeat.chars');
    expect(new NoRepeatCharsRule(3).validate('aaab')).toBeNull();
  });
});
