import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { SharedLinkTypeEnum } from 'modules/shared-links/enums/shared-link-type.enum';
import { Entity } from 'typeorm';

@Entity('shared_link_types')
export class SharedLinkTypeEntity extends BaseEnumEntity<SharedLinkTypeEnum> {}
