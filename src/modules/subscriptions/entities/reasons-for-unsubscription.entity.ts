import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { TypesOfReasonsForUnsubscriptionEntity } from 'modules/subscriptions/entities/types-of-reasons-for-unsubscription.entity';

@Entity('reasons_for_unsubscription')
export class ReasonsForUnsubscriptionEntity extends BaseEntity {
  @Column({ type: 'int' })
  accountId: number;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @ManyToOne(() => TypesOfReasonsForUnsubscriptionEntity)
  type: TypesOfReasonsForUnsubscriptionEntity;
}
