import { ValidationError } from '../error/validation.error';
import { UseCase } from './use-case';

// Exemplo de caso de uso concreto: calcula o total de um pedido.
interface CalculateTotalInput {
  items: { price: number; quantity: number }[];
  discountPercent?: number;
}

interface CalculateTotalOutput {
  subtotal: number;
  discount: number;
  total: number;
}

class CalculateTotalUseCase implements UseCase<CalculateTotalInput, CalculateTotalOutput> {
  async execute(input: CalculateTotalInput): Promise<CalculateTotalOutput> {
    if (input.items.length === 0) throw new ValidationError('order.items', 'required');
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = (subtotal * (input.discountPercent ?? 0)) / 100;
    return { subtotal, discount, total: subtotal - discount };
  }
}

describe('UseCase', () => {
  const useCase: UseCase<CalculateTotalInput, CalculateTotalOutput> = new CalculateTotalUseCase();

  it('executa e retorna a saída', async () => {
    await expect(
      useCase.execute({ items: [{ price: 10, quantity: 2 }, { price: 5, quantity: 1 }], discountPercent: 10 }),
    ).resolves.toEqual({ subtotal: 25, discount: 2.5, total: 22.5 });
  });

  it('funciona sem desconto', async () => {
    await expect(useCase.execute({ items: [{ price: 10, quantity: 1 }] })).resolves.toEqual({
      subtotal: 10,
      discount: 0,
      total: 10,
    });
  });

  it('rejeita entrada inválida', async () => {
    await expect(useCase.execute({ items: [] })).rejects.toBeInstanceOf(ValidationError);
  });
});
