import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendPdfEmailReportCommand } from 'modules/email-reports/commands/send-pdf-email-report.command';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { PostmarkMailingService } from 'modules/mailing/services/postmark-mailing.service';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { EmailReportRepository } from 'modules/email-reports/repositories/email-report.repository';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { wait } from 'modules/common/utils/wait';

@CommandHandler(SendPdfEmailReportCommand)
export class SendPdfEmailReportCommandHandler
  implements ICommandHandler<SendPdfEmailReportCommand>
{
  constructor(
    private readonly configService: ConfigService,
    private readonly postmarkMailingService: PostmarkMailingService,
    private readonly emailReportRepository: EmailReportRepository,
    private readonly emailReportsService: EmailReportsService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the process of sending out a PDF email report.
   *
   * @param {SendPdfEmailReportCommand} command - The command containing details for the PDF email report.
   * @return {Promise<void>} A Promise that resolves when the operation is complete.
   */
  async execute(command: SendPdfEmailReportCommand): Promise<void> {
    try {
      const request = await axios.post(
        this.configService.get(ConfigEnvEnum.PUPPETEER_GENERATOR),
        {
          projectId: command.projectId,
          period: TemporalFiltersEnum.Month,
          url: this.configService.get(ConfigEnvEnum.HTML_GENERATOR_URL),
        },
        {
          responseType: 'arraybuffer',
        },
      );
      await this.postmarkMailingService.sendPdfEmailReport(
        request.data,
        command.emails,
        command.projectName,
      );
      await this.emailReportRepository.save({
        id: command.emailReportId,
        lastSent: new Date(),
      });
      // for testing
      this.cliLoggingService.sendSentryCaptureMessage({
        name: 'SendPdfEmailReportCommandHandler execute:',
        extraData: {
          emails: command.emails,
          projectName: command.projectName,
        },
      });
    } catch (e) {
      this.cliLoggingService.error(
        'Error: SendPdfEmailReportCommandHandler',
        e,
        JSON.stringify(command),
      );
    }
  }
}
