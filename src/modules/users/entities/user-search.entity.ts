import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Entity, ManyToOne } from 'typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';

@Entity({ name: 'user_searches' })
export class UserSearchEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  project: ProjectEntity;
}
