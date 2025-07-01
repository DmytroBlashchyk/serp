import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { TypesOfReasonsForUnsubscriptionEnum } from 'modules/subscriptions/enums/types-of-reasons-for-unsubscription.enum';
import { Entity } from 'typeorm';

@Entity('types_of_reasons_for_unsubscription')
export class TypesOfReasonsForUnsubscriptionEntity extends BaseEnumEntity<TypesOfReasonsForUnsubscriptionEnum> {}
