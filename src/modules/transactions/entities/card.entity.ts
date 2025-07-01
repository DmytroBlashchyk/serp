import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity } from 'typeorm';

@Entity('cards')
export class CardEntity extends BaseEntity {
  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text' })
  last4: string;

  @Column({ type: 'numeric' })
  expiryYear: number;

  @Column({ type: 'numeric' })
  expiryMonth: number;
}
