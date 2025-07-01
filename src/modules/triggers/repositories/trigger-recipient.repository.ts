import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TriggerRecipientEntity } from 'modules/triggers/entities/trigger-recipient.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(TriggerRecipientEntity)
export class TriggerRecipientRepository extends BaseRepository<TriggerRecipientEntity> {
  /**
   * Retrieves all subscriptions associated with the given email address.
   *
   * @param {string} email - The email address to find subscriptions for.
   * @return {Promise<TriggerRecipientEntity[]>} A promise that resolves to an array of TriggerRecipientEntities.
   */
  async getAllSubscriptionsByEmail(
    email: string,
  ): Promise<TriggerRecipientEntity[]> {
    return this.createQueryBuilder('trigger_recipients')
      .where('trigger_recipients.email =:email', { email })
      .getMany();
  }

  /**
   * Retrieves the subscription details of a user to alerts.
   *
   * @param {IdType} id - The unique identifier of the user.
   * @return {Promise<TriggerRecipientEntity>} The subscription entity associated with the user.
   */
  async getUserSubscriptionToAlerts(
    id: IdType,
  ): Promise<TriggerRecipientEntity> {
    return this.findOne(id);
  }
}
