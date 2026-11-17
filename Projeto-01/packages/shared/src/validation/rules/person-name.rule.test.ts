import { PersonNameRule } from './person-name.rule';

describe('PersonNameRule', () => {
  const rule = new PersonNameRule();

  it('expõe o errorCode "person.name"', () => {
    expect(rule.errorCode).toBe('person.name');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([
    ['Ana Silva'],
    ['José da Silva'],
    ['  Maria   Clara  Souza  '],
    ['João\tPedro'],
    ["Joana D'Ávila"],
    ['Ana-Maria Müller'],
    ['Zoë Çelik'],
    ['Ana O’Neil'],
  ] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([
    [''],
    ['   '],
    ['Ana'],
    ['  Ana  '],
    ['Ana Silva2'],
    ['Ana @Silva'],
    ['Ana Silva!'],
    ['Ana_Silva Souza'],
    ['Ana -Silva'],
    ["Ana Silva'"],
    ['Ana Si--lva'],
    ['Ana S.'],
    [123],
    [['Ana', 'Silva']],
  ] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('person.name');
  });

  it('aceita quantidade mínima de partes customizada', () => {
    expect(new PersonNameRule(1).validate('Ana')).toBeNull();
    expect(new PersonNameRule(3).validate('Ana Silva')).toBe('person.name');
    expect(new PersonNameRule(3).validate('Ana Maria Silva')).toBeNull();
  });
});
