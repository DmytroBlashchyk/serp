import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { UserStatusEnum } from 'modules/users/enums/user-status.enum';
import { Entity } from 'typeorm';

@Entity({ name: 'user_statuses' })
export class UserStatusEntity extends BaseEnumEntity<UserStatusEnum> {}
