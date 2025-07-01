import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('')
export class HealthController {
  @Get()
  test() {
    return ' ok';
  }

  @ApiExcludeEndpoint()
  @Get('app-health')
  appHealth() {
    return `I'm alive.`;
  }
}
