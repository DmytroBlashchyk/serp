import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'reasons_for_account_deletion' })
export class ReasonsForAccountDeletionEntity extends BaseEntity {
  @Column({ type: 'int' })
  accountId: number;

  @Column({ nullable: true, type: 'text' })
  reason: string;
}
