import { IdType } from 'modules/common/types/id-type.type';

export class CreateTrialPlanCommand {
  constructor(public readonly accountId: IdType) {}
}
