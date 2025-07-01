import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { LanguageEntity } from 'modules/languages/entities/language.entity';
import { languages } from 'modules/db/seeds/data/1687948519343-Project/languages';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { checkFrequency } from 'modules/db/seeds/data/1687948519343-Project/checkFrequency';
import { searchEngines } from 'modules/db/seeds/data/1687948519343-Project/searchEngines';
import { CheckFrequencyEntity } from 'modules/check-frequency/entities/check-frequency.entity';
import { SearchEngineEntity } from 'modules/search-engines/entities/search-engine.entity';

export class Project1687948519343 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(LanguageEntity, builder, languages);
    await applySeedEnum(CheckFrequencyEntity, builder, checkFrequency);
    await applySeedEnum(SearchEngineEntity, builder, searchEngines);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(LanguageEntity, builder, languages);
    await revertSeedEnum(CheckFrequencyEntity, builder, checkFrequency);
    await revertSeedEnum(SearchEngineEntity, builder, searchEngines);
  }
}
