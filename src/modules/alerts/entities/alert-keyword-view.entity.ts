import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Entity, ManyToOne } from 'typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { AlertKeywordEntity } from 'modules/alerts/entities/alert-keyword.entity';

@Entity('alert_keywords_view')
export class AlertKeywordViewEntity extends BaseEntity {
  @ManyToOne(() => AlertKeywordEntity, { onDelete: 'CASCADE' })
  alertKeyword: AlertKeywordEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
}
