import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { DeviceTypeEntity } from 'modules/device-types/entities/device-type.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

@Injectable()
@EntityRepository(DeviceTypeEntity)
export class DeviceTypesRepository extends BaseRepository<DeviceTypeEntity> {
  /**
   * Retrieves a device type entity based on the provided name.
   *
   * @param {DeviceTypesEnum} name - The name of the device type to retrieve.
   * @return {Promise<DeviceTypeEntity>} A promise that resolves to the device type entity.
   */
  async getDeviceTypeByName(name: DeviceTypesEnum): Promise<DeviceTypeEntity> {
    return this.findOne({
      where: { name },
    });
  }
}
