import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { deviceTypes } from 'modules/db/seeds/data/1687515525888-AddDeviceTypes/deviceTypes';
import { DeviceTypeEntity } from 'modules/device-types/entities/device-type.entity';

export class AddDeviceTypes1687515525888 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(DeviceTypeEntity, builder, deviceTypes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(DeviceTypeEntity, builder, deviceTypes);
  }
}
