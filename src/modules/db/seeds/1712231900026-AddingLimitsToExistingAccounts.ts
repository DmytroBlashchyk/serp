import { MigrationInterface, QueryRunner } from 'typeorm';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { AccountLimitEntity } from 'modules/account-limits/entities/account-limit.entity';

export class AddingLimitsToExistingAccounts1712231900026
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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
    const builder = queryRunner.manager.createQueryBuilder();
    const data = [];
    for (const account of accounts) {
      const limits =
        account.subscription.tariffPlanSetting.tariffPlan
          .defaultTariffPlanLimits;
      for (const limit of limits) {
        data.push({
          account: { id: account.id },
          accountLimitType: { id: limit.limitType.id },
          limit: limit.limit,
        });
      }
    }

    await builder.insert().into(AccountLimitEntity).values(data).execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(AccountLimitEntity, {});
  }
}
