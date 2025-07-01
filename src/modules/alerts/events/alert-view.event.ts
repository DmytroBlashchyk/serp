import { IdType } from 'modules/common/types/id-type.type';

export class AlertViewEvent {
  readonly alertId: IdType;
  readonly userId: IdType;
  constructor(data: AlertViewEvent) {
    Object.assign(this, data);
  }
}
