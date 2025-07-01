import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';

export class SubscriptionStatusResponse extends WithEnumDto(
  SubscriptionStatusesEnum,
) {}
