import { IdType } from 'modules/common/types/id-type.type';

export class CreateATrialPeriodEvent {
  readonly accountId: IdType;
  constructor(data: CreateATrialPeriodEvent) {
    Object.assign(this, data);
  }
}
