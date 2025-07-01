import { IdType } from 'modules/common/types/id-type.type';
import { TypesOfReasonsForUnsubscriptionEnum } from 'modules/subscriptions/enums/types-of-reasons-for-unsubscription.enum';

export class UnsubscriptionEvent {
  readonly accountId: IdType;
  readonly typeOfReason: TypesOfReasonsForUnsubscriptionEnum;
  readonly reason?: string;

  constructor(data: UnsubscriptionEvent) {
    Object.assign(this, data);
  }
}
