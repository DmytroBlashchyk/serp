import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('')
export class HealthControllers {
  @Get('health')
  @ApiExcludeEndpoint()
  healthCheck() {
    return `I'm alive!`;
  }

  @Get()
  test() {
    return ' ok!';
  }
}
