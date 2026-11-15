/** Funções utilitárias usadas por múltiplas regras. */

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/** Tamanho de string ou array; `null` para outros tipos. */
export function lengthOf(value: unknown): number | null {
  if (isString(value) || Array.isArray(value)) return value.length;
  return null;
}

/** Converte Date | string | number em Date válida; `null` se inválida. */
export function toDate(value: unknown): Date | null {
  let date: Date | null = null;
  if (value instanceof Date) date = value;
  else if (isString(value) || isNumber(value)) date = new Date(value);
  return date !== null && !Number.isNaN(date.getTime()) ? date : null;
}

/** `true` se o valor é string e casa com a expressão regular. */
export function matches(value: unknown, regex: RegExp): boolean {
  return isString(value) && regex.test(value);
}

/** Remove tudo que não é dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Igualdade profunda para primitivos, arrays, datas e objetos simples. */
export function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}
