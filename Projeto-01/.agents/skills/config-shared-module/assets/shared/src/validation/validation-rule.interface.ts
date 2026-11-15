/**
 * Contrato comum a todas as regras de validação.
 * `validate` retorna o código de erro quando a validação falha, ou `null` quando o valor é válido.
 */
export interface ValidationRule<T = unknown> {
  readonly errorCode: string; // ex: "required", "invalid.email", "min.length"
  validate(value: T): string | null;
}
