import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleEmailReportBounceWebhookCommand } from 'modules/email-reports/commands/handle-email-report-bounce-webhook.command';
import { PostmarkMailingService } from 'modules/mailing/services/postmark-mailing.service';
import { BounceTypeEnum } from 'modules/mailing/enums/bounce-type.enum';
import { ModuleSettings } from 'modules/email-reports/consts/module-settings.const';
import { PostmarkWebhookType } from 'modules/mailing/enums/postmark-webhook-type.enum';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(HandleEmailReportBounceWebhookCommand)
export class HandleEmailReportBounceWebhookCommandHandler
  implements ICommandHandler<HandleEmailReportBounceWebhookCommand>
{
  constructor(
    private readonly postmarkMailingService: PostmarkMailingService,
    private readonly emailReportsService: EmailReportsService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}

  /**
   * Execute for handling Postmark bounce webhook
   *
   * @param command
   */
  async execute(command: HandleEmailReportBounceWebhookCommand): Promise<void> {
    try {
      if (command.recordType !== PostmarkWebhookType.Bounce) return;

      const bounces = await this.postmarkMailingService.fetchBouncesByEmail(
        command.email,
      );

      const hardBounceAmount = bounces.Bounces?.filter(
        (b) =>
          b.TypeCode >= BounceTypeEnum.HardBounce &&
          b.TypeCode < BounceTypeEnum.SoftBounce,
      )?.length;

      if (hardBounceAmount > ModuleSettings.MAX_HARD_BOUNCE_AMOUNT) {
        return await this.handleBouncedEmail(command.email);
      }

      const softBounceAmount = bounces.Bounces?.filter(
        (b) => b.TypeCode >= BounceTypeEnum.SoftBounce,
      )?.length;

      if (softBounceAmount > ModuleSettings.MAX_SOFT_BOUNCE_AMOUNT) {
        return await this.handleBouncedEmail(command.email);
      }
    } catch (e) {
      this.cliLoggingService.error(
        'Error: HandleEmailReportBounceWebhookCommandHandler',
        e,
        JSON.stringify(command),
      );
    }
  }

  /**
   * Handle bounced email
   *
   * @private
   * @param email
   */
  private async handleBouncedEmail(email: string): Promise<void> {
    const createSuppression =
      await this.postmarkMailingService.createSuppressions([email]);

    const filed = createSuppression.Suppressions.find(
      (sup) => sup.Status === 'Failed',
    );

    if (filed)
      throw new Error(
        `Failed createSuppressions with Message: ${filed.Message}`,
      );

    await this.emailReportsService.handleBouncedReportEmail(email);

    return;
  }
}
