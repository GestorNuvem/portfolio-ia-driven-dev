import { Controller, Get } from '@nestjs/common';

@Controller('__MODULE_NAME__')
export class __CLASS_NAME__Controller {
  @Get()
  getInfo() {
    return {
      module: '__MODULE_NAME__',
      message: 'Módulo __MODULE_NAME__ funcionando',
    };
  }
}
