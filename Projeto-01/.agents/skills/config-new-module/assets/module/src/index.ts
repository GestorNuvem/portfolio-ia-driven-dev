export const MODULE_NAME = '__MODULE_NAME__';

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
