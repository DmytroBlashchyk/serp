import { IdType } from 'modules/common/types/id-type.type';

export class SendCsvEmailReportEvent {
  readonly emailReportId: IdType;
  readonly projectId: IdType;
  readonly recipients: string[];

  constructor(data: SendCsvEmailReportEvent) {
    Object.assign(this, data);
  }
}
