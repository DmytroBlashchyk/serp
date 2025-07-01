import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';

@Entity('visitors')
export class VisitorsEntity extends BaseEntity {
  @Column({ type: 'inet' })
  ipAddress: string;

  @Column({ type: 'numeric', default: 1 })
  numberOfDailyRequests: number;
}
