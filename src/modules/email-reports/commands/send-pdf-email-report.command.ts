import { IdType } from 'modules/common/types/id-type.type';

export class SendPdfEmailReportCommand {
  constructor(
    public readonly emails: string[],
    public readonly projectId: IdType,
    public readonly projectName: string,
    public readonly period: string,
    public readonly emailReportId: IdType,
  ) {}
}
