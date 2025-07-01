import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { SubscriptionStatusEntity } from 'modules/subscriptions/entities/subscription-status.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';

@Injectable()
@EntityRepository(SubscriptionStatusEntity)
export class SubscriptionStatusRepository extends BaseRepository<SubscriptionStatusEntity> {
  /**
   * Retrieves the subscription status entity based on the given status name.
   *
   * @param {SubscriptionStatusesEnum} name - The name of the subscription status to retrieve.
   * @return {Promise<SubscriptionStatusEntity>} A promise that resolves to the subscription status entity.
   */
  async getSubscriptionStatusByName(
    name: SubscriptionStatusesEnum,
  ): Promise<SubscriptionStatusEntity> {
    return this.findOne({ where: { name } });
  }
}
