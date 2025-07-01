import { IdType } from 'modules/common/types/id-type.type';

export class AlertViewCommand {
  constructor(
    public readonly alertId: IdType,
    public readonly userId: IdType,
  ) {}
}
