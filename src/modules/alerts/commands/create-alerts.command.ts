import { IdType } from 'modules/common/types/id-type.type';

export class CreateAlertsCommand {
  constructor(public readonly triggerId: IdType) {}
}
