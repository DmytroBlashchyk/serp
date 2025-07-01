import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { ReportTypeEnum } from 'modules/email-reports/enums/report-type.enum';

export class FormatResponse extends WithEnumDto(ReportTypeEnum) {}
