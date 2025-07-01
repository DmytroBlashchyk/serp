import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TypesOfReasonsForUnsubscriptionEntity } from 'modules/subscriptions/entities/types-of-reasons-for-unsubscription.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TypesOfReasonsForUnsubscriptionEnum } from 'modules/subscriptions/enums/types-of-reasons-for-unsubscription.enum';

@Injectable()
@EntityRepository(TypesOfReasonsForUnsubscriptionEntity)
export class TypesOfReasonsForUnsubscriptionRepository extends BaseRepository<TypesOfReasonsForUnsubscriptionEntity> {
  /**
   * Retrieves a type of reason for unsubscription by its name.
   *
   * @param {TypesOfReasonsForUnsubscriptionEnum} name - The name of the reason for unsubscription.
   * @return {Promise<TypesOfReasonsForUnsubscriptionEntity>} A promise that resolves to the unsubscription reason entity.
   */
  getTypeByName(
    name: TypesOfReasonsForUnsubscriptionEnum,
  ): Promise<TypesOfReasonsForUnsubscriptionEntity> {
    return this.findOne({ where: { name } });
  }
}
