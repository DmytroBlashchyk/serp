import { Column, Entity, ManyToOne } from 'typeorm';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { UserEntity } from 'modules/users/entities/user.entity';

@Entity('notes')
export class NoteEntity extends BaseEntity {
  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  author: UserEntity;
}
