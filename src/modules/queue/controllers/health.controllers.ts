import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('health-check')
export class HealthControllers {
  @Get('')
  @ApiExcludeEndpoint()
  healthCheck() {
    return `I'm alive`;
  }
}
