import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { EmailReportFrequencyEnum } from 'modules/email-reports/enums/email-report-frequency.enum';

export class FrequencyResponse extends WithEnumDto(EmailReportFrequencyEnum) {}
