import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { PaymentMethodsEnum } from 'modules/payments/enums/payment-methods.enum';

export class PaymentMethodResponse extends WithEnumDto(PaymentMethodsEnum) {}
