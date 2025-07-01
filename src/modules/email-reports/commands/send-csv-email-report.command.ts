import { IdType } from 'modules/common/types/id-type.type';

export class SendCsvEmailReportCommand {
  constructor(
    public readonly projectId: IdType,
    public readonly emails: string[],
    public readonly emailReportId: IdType,
  ) {}
}
