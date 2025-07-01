import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { ReportDeliveryTimeEnum } from 'modules/email-reports/enums/report-delivery-time.enum';

export class DeliveryTimeResponse extends WithEnumDto(ReportDeliveryTimeEnum) {}
