import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

/**
 * Cada parte do nome: somente letras (incluindo acentuadas, ex.: "José", "Müller"),
 * podendo ter apóstrofo ou hífen entre letras (ex.: "D'Ávila", "Ana-Maria").
 */
const NAME_PART_REGEX = /^\p{L}+(?:['’-]\p{L}+)*$/u;

/**
 * Valida o nome completo de uma pessoa:
 * - no mínimo duas partes (nome e sobrenome); espaços extras são ignorados
 * - cada parte só pode conter letras, apóstrofo ou hífen (sem números ou caracteres especiais)
 */
export class PersonNameRule implements ValidationRule {
  readonly errorCode = 'person.name';

  constructor(private readonly minParts: number = 2) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    if (!isString(value)) return this.errorCode;
    const parts = value.trim().split(/\s+/).filter((part) => part.length > 0);
    if (parts.length < this.minParts) return this.errorCode;
    return parts.every((part) => NAME_PART_REGEX.test(part)) ? null : this.errorCode;
  }
}
