import { Column, MigrationInterface, QueryRunner } from 'typeorm';
import { locations } from 'modules/db/seeds/data/1705571191126-AddLocations/locations';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { LocationEntity } from 'modules/countries/entities/location.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';

export class AddLocations1705571191126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    const result = await locations;
    let data = [];
    for (const item of result) {
      data.push({
        locationName: item.location_name,
        locationCode: item.location_code,
        locationCodeParent: item.location_code_parent,
        countryIsoCode: item.country_iso_code,
        locationType: item.location_type,
      });
      if (data.length === 100) {
        await applySeedEnum(LocationEntity, builder, data);
        data = [];
      }
    }
    if (data.length > 0) {
      await applySeedEnum(LocationEntity, builder, data);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.manager.createQueryBuilder();
  }
}
