import { IdType } from 'modules/common/types/id-type.type';
import { TypesOfReasonsForUnsubscriptionEnum } from 'modules/subscriptions/enums/types-of-reasons-for-unsubscription.enum';

export class UnsubscriptionCommand {
  constructor(
    public readonly accountId: IdType,
    public readonly typeOfReason: TypesOfReasonsForUnsubscriptionEnum,
    public readonly reason?: string,
  ) {}
}
