import { IdType } from 'modules/common/types/id-type.type';

export class CustomerUpgradeEvent {
  readonly userId: IdType;
  readonly newEmail: string;
  constructor(data: CustomerUpgradeEvent) {
    Object.assign(this, data);
  }
}
