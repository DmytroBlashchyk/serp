import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TypesOfReasonsForUnsubscriptionEntity } from 'modules/subscriptions/entities/types-of-reasons-for-unsubscription.entity';
import { typesOfReasonsForUnsubscription } from 'modules/db/seeds/data/1697461669540-AddTypesOfReasonsForUnsubscription/typesOfReasonsForUnsubscription';

export class AddTypesOfReasonsForUnsubscription1697461669540
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(
      TypesOfReasonsForUnsubscriptionEntity,
      builder,
      typesOfReasonsForUnsubscription,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(
      TypesOfReasonsForUnsubscriptionEntity,
      builder,
      typesOfReasonsForUnsubscription,
    );
  }
}
