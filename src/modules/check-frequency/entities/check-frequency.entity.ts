import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { Entity } from 'typeorm';

@Entity('check-frequency')
export class CheckFrequencyEntity extends BaseEnumEntity<CheckFrequencyEnum> {}
