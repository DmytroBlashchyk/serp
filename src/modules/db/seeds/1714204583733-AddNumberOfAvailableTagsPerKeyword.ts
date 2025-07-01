import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { LimitTypeEntity } from 'modules/account-limits/entities/limit-type.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';
import { tariffPlanLimitsForNumberOfAvailableTagsPerKeyword } from 'modules/db/seeds/data/1714204583733-AddNumberOfAvailableTagsPerKeyword/tariffPlanLimitsForNumberOfAvailableTagsPerKeyword';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { AccountLimitEntity } from 'modules/account-limits/entities/account-limit.entity';

export class AddNumberOfAvailableTagsPerKeyword1714204583733
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(LimitTypeEntity, builder, [
      { name: 'Number Of Available Tags Per Keyword' },
    ]);
    const builder2 = queryRunner.manager.createQueryBuilder();
    let data = [];
    for (const tariffPlan of tariffPlanLimitsForNumberOfAvailableTagsPerKeyword) {
      const item = await queryRunner.manager.findOne(TariffPlanEntity, {
        where: { name: tariffPlan.tariffPlanName },
      });
      const limit = await queryRunner.manager.findOne(LimitTypeEntity, {
        where: { name: tariffPlan.limitTypeName },
      });
      data.push({
        tariffPlan: item,
        limitType: limit,
        limit: tariffPlan.limit,
      });
    }
    await builder2
      .insert()
      .into(DefaultTariffPlanLimitEntity)
      .values(data)
      .execute();
    const repository = queryRunner.manager.getRepository(AccountEntity);
    const accounts = await repository
      .createQueryBuilder('accounts')
      .leftJoinAndSelect('accounts.subscription', 'subscription')
      .leftJoinAndSelect('subscription.tariffPlanSetting', 'tariffPlanSetting')
      .leftJoinAndSelect('tariffPlanSetting.tariffPlan', 'tariffPlan')
      .leftJoinAndSelect(
        'tariffPlan.defaultTariffPlanLimits',
        'defaultTariffPlanLimits',
      )
      .leftJoinAndSelect('defaultTariffPlanLimits.limitType', 'limitType')
      .getMany();

    data = [];
    for (const account of accounts) {
      const limits =
        account.subscription.tariffPlanSetting.tariffPlan
          .defaultTariffPlanLimits;
      for (const limit of limits) {
        if (limit.limitType.name === 'Number Of Available Tags Per Keyword') {
          data.push({
            account: { id: account.id },
            accountLimitType: { id: limit.limitType.id },
            limit: limit.limit,
          });
        }
      }
    }
    await builder.insert().into(AccountLimitEntity).values(data).execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(LimitTypeEntity, builder, [
      { name: 'Number Of Available Tags Per Keyword' },
    ]);
  }
}
