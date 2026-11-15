import { getModuleInfo, MODULE_NAME } from './index';

describe('__MODULE_NAME__', () => {
  it('deve expor o nome do módulo', () => {
    expect(MODULE_NAME).toBe('__MODULE_NAME__');
  });

  it('deve retornar as informações do módulo', () => {
    expect(getModuleInfo()).toEqual({
      name: '__MODULE_NAME__',
      message: 'Módulo __MODULE_NAME__ configurado com sucesso',
    });
  });
});
