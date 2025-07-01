import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Entity, ManyToOne } from 'typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';

@Entity('alerts_view')
export class AlertViewEntity extends BaseEntity {
  @ManyToOne(() => AlertEntity, { onDelete: 'CASCADE' })
  alert: AlertEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
}
