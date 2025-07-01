import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity } from 'typeorm';

@Entity('timezones')
export class TimezoneEntity extends BaseEntity {
  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  tzCode: string;

  @Column('text', { nullable: true })
  utc: string;
}
