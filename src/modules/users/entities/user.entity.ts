import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { UserStatusEntity } from 'modules/users/entities/user-status.entity';
import { QuantityColumn } from 'modules/db/decorators/quantity-column.decorator';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { FolderEntity } from 'modules/folders/entities/folder.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ nullable: true, type: 'text' })
  username?: string;

  @Column({ nullable: true, type: 'text' })
  firstName?: string;

  @Column({ nullable: true, type: 'text' })
  lastName?: string;

  @Column({ unique: true, nullable: false, type: 'text' })
  email: string;

  @Column({ default: false, type: 'boolean' })
  isEmailConfirmed: boolean;

  @Column({ type: 'text', nullable: true })
  emailConfirmationToken?: string;

  @Column({ type: 'text', nullable: true })
  password?: string;

  @Column({ type: 'text', nullable: true })
  passwordResetConfirmationToken?: string;

  @ManyToOne(() => UserStatusEntity, { nullable: false })
  status: UserStatusEntity;

  @QuantityColumn({ default: 0 })
  numberOfForgotPasswordLetterRequests: number;

  @QuantityColumn({ default: 0 })
  numberOfResendingMailConfirmationLetterRequest: number;

  @OneToOne(() => AccountEntity, (account) => account.owner, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  account: AccountEntity;

  @OneToMany(() => AccountUserEntity, (accountUser) => accountUser.user, {
    cascade: true,
  })
  accountUsers: AccountUserEntity[];

  @ManyToMany(() => ProjectEntity, (project) => project.users)
  projects: ProjectEntity[];

  @ManyToMany(() => FolderEntity, (folder) => folder.users)
  folders: FolderEntity[];

  @Column({ type: 'decimal', nullable: true })
  googleId?: number;
}
