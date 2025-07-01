import { MigrationInterface, QueryRunner } from 'typeorm';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';

export class RenamingOfTariffPlans1717683510646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(TariffPlanEntity);
    const tariffPlans = await repository
      .createQueryBuilder('tariff_plans')
      .getMany();
    for (const tariffPlan of tariffPlans) {
      switch (tariffPlan.name) {
        case TariffPlansEnum.StarterPackage:
          tariffPlan.name = TariffPlansEnum.StarterPlan;
          break;
        case TariffPlansEnum.ProfessionalPackage:
          tariffPlan.name = TariffPlansEnum.ProfessionalPlan;
          break;
        case TariffPlansEnum.EnterprisePackage:
          tariffPlan.name = TariffPlansEnum.EnterprisePlan;
          break;
        case TariffPlansEnum.Custom1Package:
          tariffPlan.name = TariffPlansEnum.Custom1Plan;
          break;
        case TariffPlansEnum.Custom2Package:
          tariffPlan.name = TariffPlansEnum.Custom2Plan;
          break;
        case TariffPlansEnum.Custom3Package:
          tariffPlan.name = TariffPlansEnum.Custom3Plan;
          break;
        case TariffPlansEnum.Custom4Package:
          tariffPlan.name = TariffPlansEnum.Custom4Plan;
          break;
        case TariffPlansEnum.Custom5Package:
          tariffPlan.name = TariffPlansEnum.Custom5Plan;
          break;
        default:
      }
    }
    await repository.save(tariffPlans);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(TariffPlanEntity);
    const tariffPlans = await repository
      .createQueryBuilder('tariff_plans')
      .getMany();
    for (const tariffPlan of tariffPlans) {
      switch (tariffPlan.name) {
        case TariffPlansEnum.StarterPlan:
          tariffPlan.name = TariffPlansEnum.StarterPackage;
          break;
        case TariffPlansEnum.ProfessionalPlan:
          tariffPlan.name = TariffPlansEnum.ProfessionalPackage;
          break;
        case TariffPlansEnum.EnterprisePlan:
          tariffPlan.name = TariffPlansEnum.EnterprisePackage;
          break;
        case TariffPlansEnum.Custom1Plan:
          tariffPlan.name = TariffPlansEnum.Custom1Package;
          break;
        case TariffPlansEnum.Custom2Plan:
          tariffPlan.name = TariffPlansEnum.Custom2Package;
          break;
        case TariffPlansEnum.Custom3Plan:
          tariffPlan.name = TariffPlansEnum.Custom3Package;
          break;
        case TariffPlansEnum.Custom4Plan:
          tariffPlan.name = TariffPlansEnum.Custom4Package;
          break;
        case TariffPlansEnum.Custom5Plan:
          tariffPlan.name = TariffPlansEnum.Custom5Package;
          break;
        default:
      }
    }
    await repository.save(tariffPlans);
  }
}
