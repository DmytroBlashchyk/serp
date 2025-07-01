import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { googleDomains } from 'modules/db/seeds/data/1688220681978-addGoogleDomains/googleDomains';
import { GoogleDomainEntity } from 'modules/google-domains/entities/google-domain.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';

export class addGoogleDomains1688220681978 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(GoogleDomainEntity, builder, await googleDomains);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(GoogleDomainEntity, builder, await googleDomains);
  }
}
