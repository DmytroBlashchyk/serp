import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { Entity, ManyToMany } from 'typeorm';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';

@Entity({ name: 'desktop_types' })
export class DeviceTypeEntity extends BaseEnumEntity<DeviceTypesEnum> {
  @ManyToMany(() => KeywordEntity, (keyword) => keyword.deviceType)
  keywords: KeywordEntity[];
}
