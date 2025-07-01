import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { PaymentMethodEntity } from 'modules/payments/entities/payment-method.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { PaymentMethodsEnum } from 'modules/payments/enums/payment-methods.enum';

@Injectable()
@EntityRepository(PaymentMethodEntity)
export class PaymentMethodRepository extends BaseRepository<PaymentMethodEntity> {
  /**
   * Retrieves a payment method by its name.
   *
   * @param {PaymentMethodsEnum} name - The name of the payment method to retrieve.
   * @return {Promise<PaymentMethodEntity>} - A promise that resolves to the payment method entity.
   */
  async getPaymentMethodByName(
    name: PaymentMethodsEnum,
  ): Promise<PaymentMethodEntity> {
    return this.findOne({ name });
  }
}
