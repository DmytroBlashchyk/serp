import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { PaymentMethodsEnum } from 'modules/payments/enums/payment-methods.enum';
import { Entity } from 'typeorm';

@Entity('payment_methods')
export class PaymentMethodEntity extends BaseEnumEntity<PaymentMethodsEnum> {}
