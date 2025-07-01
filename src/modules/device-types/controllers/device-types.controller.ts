import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DeviceTypesService } from 'modules/device-types/services/device-types.service';
import { DeviceTypesResponse } from 'modules/device-types/responses/device-types.response';

@Controller('device-types')
@ApiTags('Device-types')
export class DeviceTypesController {
  constructor(private readonly deviceTypesService: DeviceTypesService) {}

  /**
   * Fetches and returns all available device types.
   *
   * @return {Promise<DeviceTypesResponse>} A promise that resolves to a response containing all device types.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: DeviceTypesResponse })
  @Get()
  getAllDeviceTypes(): Promise<DeviceTypesResponse> {
    return this.deviceTypesService.getAllDeviceTypes();
  }
}
