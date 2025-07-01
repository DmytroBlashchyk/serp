import { IdType } from 'modules/common/types/id-type.type';
import { TypesOfReasonsForUnsubscriptionEnum } from 'modules/subscriptions/enums/types-of-reasons-for-unsubscription.enum';

export interface UnsubscriptionType {
  reason?: string;
  accountId: IdType;
  typeOfReason: TypesOfReasonsForUnsubscriptionEnum;
}
