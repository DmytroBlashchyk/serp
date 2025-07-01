import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { UserEntity } from 'modules/users/entities/user.entity';
import { RoleEntity } from 'modules/users/entities/role.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { FolderEntity } from 'modules/folders/entities/folder.entity';

@Entity({ name: 'invitations' })
export class InvitationEntity extends BaseEntity {
  @Column({ type: 'text', nullable: false })
  invitationUser: string;

  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  account: AccountEntity;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => RoleEntity)
  role: RoleEntity;

  @ManyToMany(() => ProjectEntity, { cascade: true })
  @JoinTable({ name: 'projects_invitations' })
  projectsInvitations: ProjectEntity[];

  @ManyToMany(() => FolderEntity)
  @JoinTable({ name: 'folders_invitations' })
  foldersInvitations: FolderEntity[];
}
