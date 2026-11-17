import { getModuleInfo, MODULE_NAME } from './index';

describe('auth', () => {
  it('deve expor o nome do módulo', () => {
    expect(MODULE_NAME).toBe('auth');
  });

  it('deve retornar as informações do módulo', () => {
    expect(getModuleInfo()).toEqual({
      name: 'auth',
      message: 'Módulo auth configurado com sucesso',
    });
  });
});
