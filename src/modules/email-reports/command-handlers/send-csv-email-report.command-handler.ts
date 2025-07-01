import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendCsvEmailReportCommand } from 'modules/email-reports/commands/send-csv-email-report.command';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { PostmarkMailingService } from 'modules/mailing/services/postmark-mailing.service';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { SortOrderEnum } from 'modules/common/enums/sort-order.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { CsvEmailReportTransformer } from 'modules/email-reports/transformers/csv-email-report.transformer';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { EmailReportRepository } from 'modules/email-reports/repositories/email-report.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(SendCsvEmailReportCommand)
export class SendCsvEmailReportCommandHandler
  implements ICommandHandler<SendCsvEmailReportCommand>
{
  constructor(
    private readonly emailReportsService: EmailReportsService,
    private readonly postmarkMailingService: PostmarkMailingService,
    private readonly csvEmailReportTransformer: CsvEmailReportTransformer,
    private readonly projectsService: ProjectsService,
    private readonly keywordRepository: KeywordRepository,
    private readonly emailReportRepository: EmailReportRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the SendCsvEmailReportCommand which retrieves a project by ID, fetches keywords and their positions,
   * transforms the data, generates a CSV email report and sends it via email. It also schedules the next delivery
   * of the report.
   *
   * @param {SendCsvEmailReportCommand} command - The command containing the necessary information to send the CSV email report.
   * @return {Promise<void>} - An empty promise indicating successful execution or an error being caught.
   */
  async execute(command: SendCsvEmailReportCommand): Promise<void> {
    try {
      const project = await this.projectsService.getProjectById(
        command.projectId,
      );
      const { items } =
        await this.keywordRepository.getKeywordsWithKeywordPositions(
          command.projectId,
          {
            page: 1,
            limit: 1000,
            sortBy: null,
            sortOrder: SortOrderEnum.desc,
          },
          {
            top3: BooleanEnum.FALSE,
            top10: BooleanEnum.FALSE,
            top30: BooleanEnum.FALSE,
            top100: BooleanEnum.FALSE,
            improved: BooleanEnum.FALSE,
            declined: BooleanEnum.FALSE,
            notRanked: BooleanEnum.FALSE,
            lost: BooleanEnum.FALSE,
            noChange: BooleanEnum.FALSE,
          },
          DeviceTypesEnum.DesktopAndMobile,
        );

      const data = await this.csvEmailReportTransformer.transform(
        items,
        project,
      );
      const csv = await this.emailReportsService.generateEmailReport(data);
      await this.postmarkMailingService.sendCsvEmailReport(
        csv,
        command.emails,
        project.projectName,
      );
      await this.emailReportRepository.save({
        id: command.emailReportId,
        lastSent: new Date(),
      });
      // for testing
      this.cliLoggingService.sendSentryCaptureMessage({
        name: 'SendCsvEmailReportCommandHandler execute:',
        extraData: {
          emails: command.emails,
          projectName: project.projectName,
        },
      });
    } catch (error) {
      this.cliLoggingService.error(
        `Error: SendCsvEmailReportCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
