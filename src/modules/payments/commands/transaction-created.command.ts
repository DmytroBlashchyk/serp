import { IdType } from 'modules/common/types/id-type.type';

export class TransactionCreatedCommand {
  constructor(
    public readonly accountId: IdType,
    public readonly transactionId: string,
  ) {}
}
