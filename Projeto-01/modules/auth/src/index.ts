export const MODULE_NAME = 'auth';

export interface ModuleInfo {
  name: string;
  message: string;
}

export function getModuleInfo(): ModuleInfo {
  return {
    name: MODULE_NAME,
    message: `Módulo ${MODULE_NAME} configurado com sucesso`,
  };
}

export * from './user/model/user.entity';
export * from './user/provider/user.repository';
export * from './user/provider/crypto.provider';
export * from './user/usecase/register-user.usecase';
