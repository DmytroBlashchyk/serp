import { IdType } from 'modules/common/types/id-type.type';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';

export class CreateAccountLimitsEvent {
  public readonly accountId: IdType;
  public readonly tariffPlanName: TariffPlansEnum;
  constructor(data: CreateAccountLimitsEvent) {
    Object.assign(this, data);
  }
}
