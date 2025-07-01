import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAlertsCommand } from 'modules/alerts/commands/create-alerts.command';
import { AlertRepository } from 'modules/alerts/repositories/alert.repository';
import { AlertKeywordRepository } from 'modules/alerts/repositories/alert-keyword.repository';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { ProjectAlertsToEmailsTransformer } from 'modules/alerts/transformers/project-alerts-to-emails.transformer';
import { MailingService } from 'modules/mailing/services/mailing.service';
import { KeywordsAlertsToEmailsTransformer } from 'modules/alerts/transformers/keywords-alerts-to-emails.transformer';
import { TriggerKeywordRepository } from 'modules/triggers/repositories/trigger-keyword.repository';
import { TriggerRepository } from 'modules/triggers/repositories/trigger.repository';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { KeywordsAlertsToEmailsForGoogleLocalTransformer } from 'modules/alerts/transformers/keywords-alerts-to-emails-for-google-local.transformer';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { ProjectAlertsToEmailsForGoogleLocalTransformer } from 'modules/alerts/transformers/project-alerts-to-emails-for-google-local.transformer';

@CommandHandler(CreateAlertsCommand)
export class CreateAlertsCommandHandler
  implements ICommandHandler<CreateAlertsCommand>
{
  constructor(
    private readonly alertRepository: AlertRepository,
    private readonly alertKeywordRepository: AlertKeywordRepository,
    private readonly projectAlertsToEmailsTransformer: ProjectAlertsToEmailsTransformer,
    private readonly projectAlertsToEmailsForGoogleLocalTransformer: ProjectAlertsToEmailsForGoogleLocalTransformer,
    private readonly mailingService: MailingService,
    private readonly keywordsAlertsToEmailsTransformer: KeywordsAlertsToEmailsTransformer,
    private readonly keywordsAlertsToEmailsForGoogleLocalTransformer: KeywordsAlertsToEmailsForGoogleLocalTransformer,
    private readonly triggerKeywordRepository: TriggerKeywordRepository,
    private readonly triggerRepository: TriggerRepository,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the given CreateAlertsCommand by processing triggers, retrieving related data,
   * saving alerts, and sending emails based on the trigger type and project search engine.
   *
   * @param {CreateAlertsCommand} command - The command containing information to create alerts.
   * @return {Promise<void>} A promise that resolves when the execution completes.
   */
  async execute(command: CreateAlertsCommand): Promise<void> {
    try {
      const trigger = await this.triggerRepository.getTriggersWithRelations(
        command.triggerId,
      );
      const result =
        await this.triggerKeywordRepository.getDataOfProjectKeywordsHitByTriggerRule(
          command.triggerId,
        );

      if (result.length) {
        const alert = await this.alertRepository.save({ trigger });
        await this.alertKeywordRepository.save(
          result.map((item) => {
            return {
              alert,
              keyword: {
                id: item.keyword_id,
              },
              keywordPositionsForDay: { id: item.keyword_positions_for_day_id },
            };
          }),
        );

        if (trigger.recipients.length) {
          if (trigger.type.name === TriggerTypeEnum.ByKeywords) {
            if (
              [
                SearchEnginesEnum.GoogleMaps,
                SearchEnginesEnum.GoogleMyBusiness,
              ].includes(trigger.project.searchEngine.name)
            ) {
              const data =
                await this.keywordsAlertsToEmailsForGoogleLocalTransformer.transform(
                  trigger,
                  result,
                  alert,
                );
              const recipients =
                await this.accountLimitsService.limitingSendingOfEmailAlerts(
                  trigger.project.account.id,
                  trigger.recipients,
                );
              if (recipients.length > 0) {
                if (
                  trigger.project.searchEngine.name ===
                  SearchEnginesEnum.GoogleMyBusiness
                ) {
                  await this.mailingService.sendKeywordsAlertsToEmailsForLocal(
                    recipients.map((recipient) => recipient.email),
                    data,
                  );
                } else {
                  await this.mailingService.sendKeywordsAlertsToEmailsForGoogleMaps(
                    recipients.map((recipient) => recipient.email),
                    data,
                  );
                }
              }
            } else {
              const data =
                await this.keywordsAlertsToEmailsTransformer.transform(
                  trigger,
                  result,
                  alert,
                );
              const recipients =
                await this.accountLimitsService.limitingSendingOfEmailAlerts(
                  trigger.project.account.id,
                  trigger.recipients,
                );
              if (recipients.length > 0) {
                await this.mailingService.sendKeywordsAlertsToEmails(
                  recipients.map((recipient) => recipient.email),
                  data,
                );
              }
            }
          } else {
            if (
              [
                SearchEnginesEnum.GoogleMyBusiness,
                SearchEnginesEnum.GoogleMaps,
              ].includes(trigger.project.searchEngine.name)
            ) {
              const data =
                await this.projectAlertsToEmailsForGoogleLocalTransformer.transform(
                  trigger,
                  result,
                  alert,
                );
              const recipients =
                await this.accountLimitsService.limitingSendingOfEmailAlerts(
                  trigger.project.account.id,
                  trigger.recipients,
                );
              if (recipients.length > 0) {
                if (
                  trigger.project.searchEngine.name ===
                  SearchEnginesEnum.GoogleMyBusiness
                ) {
                  await this.mailingService.sendProjectAlertsToEmailsForLocal(
                    recipients.map((recipient) => recipient.email),
                    data,
                  );
                } else {
                  await this.mailingService.sendProjectAlertsToEmailsForGoogleMaps(
                    recipients.map((recipient) => recipient.email),
                    data,
                  );
                }
              }
            } else {
              const data =
                await this.projectAlertsToEmailsTransformer.transform(
                  trigger,
                  result,
                  alert,
                );
              const recipients =
                await this.accountLimitsService.limitingSendingOfEmailAlerts(
                  trigger.project.account.id,
                  trigger.recipients,
                );
              if (recipients.length > 0) {
                await this.mailingService.sendProjectAlertsToEmails(
                  recipients.map((recipient) => recipient.email),
                  data,
                );
              }
            }
          }
        }
        await this.triggerKeywordRepository.changesInInitializationOfTriggerKeywords(
          result.map((item) => item.keyword_id),
          trigger.id,
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateAlertsCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
