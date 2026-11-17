import { PastDateRule } from './past-date.rule';

describe('PastDateRule', () => {
  const rule = new PastDateRule(() => new Date('2024-06-15T00:00:00Z'));

  it('expõe o errorCode "past.date"', () => {
    expect(rule.errorCode).toBe('past.date');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-06-14']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-06-15T00:00:00Z'], ['2025-01-01'], ['abc']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('past.date');
  });

  it('usa a data atual por padrão', () => {
    expect(new PastDateRule().validate('2000-01-01')).toBeNull();
    expect(new PastDateRule().validate('3000-01-01')).toBe('past.date');
  });
});
