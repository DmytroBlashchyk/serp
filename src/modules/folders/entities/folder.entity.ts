import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { UserEntity } from 'modules/users/entities/user.entity';

@Entity('folders')
@Tree('nested-set')
export class FolderEntity extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @TreeChildren()
  children: FolderEntity[];

  @TreeParent({ onDelete: 'CASCADE' })
  parent: FolderEntity;

  @ManyToMany(() => ProjectEntity, (project) => project.folders, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'projects_folders' })
  projects: ProjectEntity[];

  @ManyToOne(() => AccountEntity, { nullable: true, onDelete: 'CASCADE' })
  account?: AccountEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  owner: UserEntity;

  @ManyToMany(() => UserEntity, (user) => user.folders, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  @JoinTable({ name: 'users_folders' })
  users: UserEntity[];
}
