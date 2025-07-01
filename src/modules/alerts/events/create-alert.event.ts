import { IdType } from 'modules/common/types/id-type.type';

export class CreateAlertEvent {
  readonly triggerId: IdType;
  constructor(data: CreateAlertEvent) {
    Object.assign(this, data);
  }
}
