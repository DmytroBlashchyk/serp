import { IdType } from 'modules/common/types/id-type.type';

export class SendPdfEmailReportEvent {
  readonly emailReportId: IdType;
  readonly projectId: IdType;
  readonly recipients: string[];
  readonly period: string;

  constructor(data: SendPdfEmailReportEvent) {
    Object.assign(this, data);
  }
}
