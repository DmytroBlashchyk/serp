import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { SearchEngineEntity } from 'modules/search-engines/entities/search-engine.entity';
import { searchEngines } from 'modules/db/seeds/data/1719580415065-AddNewSearchEngines/searchEngines';

export class AddNewSearchEngines1719580415065 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // const builder = queryRunner.manager.createQueryBuilder();
    // await applySeedEnum(SearchEngineEntity, builder, searchEngines);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // const builder = queryRunner.manager.createQueryBuilder();
    // await revertSeedEnum(SearchEngineEntity, builder, searchEngines);
  }
}
