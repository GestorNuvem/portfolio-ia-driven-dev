/**
 * Provedor de criptografia de senhas (usado nos casos de uso de registrar usuário e login).
 * Apenas o contrato — a implementação (ex.: bcrypt) fica em outra camada da aplicação.
 */
export interface CryptoProvider {
  /** Gera o hash da senha em texto puro. */
  encrypt(password: string): Promise<string>;

  /** Retorna `true` se a senha em texto puro corresponde ao hash informado. */
  compare(password: string, hash: string): Promise<boolean>;
}
