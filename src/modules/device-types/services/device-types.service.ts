import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { DeviceTypesResponse } from 'modules/device-types/responses/device-types.response';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { DeviceTypeEntity } from 'modules/device-types/entities/device-type.entity';

@Injectable()
export class DeviceTypesService {
  constructor(private readonly desktopTypesRepository: DeviceTypesRepository) {}

  /**
   * Retrieves all device types from the repository.
   *
   * @return {Promise<DeviceTypesResponse>} A promise that resolves to a DeviceTypesResponse containing an array of device types.
   */
  async getAllDeviceTypes(): Promise<DeviceTypesResponse> {
    const deviceTypes = await this.desktopTypesRepository.find();
    return new DeviceTypesResponse({ items: deviceTypes });
  }

  /**
   * Fetches the device type information based on the provided device type name.
   *
   * @param {DeviceTypesEnum} name - The name of the device type to be retrieved.
   * @return {Promise<DeviceTypeEntity>} - A promise that resolves to the device type entity.
   * @throws {NotFoundException} - Thrown if no device type is found with the specified name.
   */
  async getDeviceType(name: DeviceTypesEnum): Promise<DeviceTypeEntity> {
    const deviceType = await this.desktopTypesRepository.getDeviceTypeByName(
      name,
    );
    if (!deviceType) {
      throw new NotFoundException('Device Type not found');
    }
    return deviceType;
  }
}
