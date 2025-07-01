import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';
import { Entity } from 'typeorm';

@Entity('transaction_statuses')
export class TransactionStatusEntity extends BaseEnumEntity<TransactionStatusesEnum> {}
