import { QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { CountryEntity } from 'modules/countries/entities/country.entity';
import { countries } from 'modules/db/seeds/data/1686657722896-Countries/countries';

export class Countries1686657722896 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    await applySeedEnum(CountryEntity, builder, countries);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(CountryEntity, builder, countries);
  }
}
