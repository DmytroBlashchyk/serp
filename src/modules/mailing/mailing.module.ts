import { Module } from '@nestjs/common';
import { RateLimiterWrapperFactoryService } from 'modules/common/services/rate-limiter-factory.service';
import { MailingService } from 'modules/mailing/services/mailing.service';
import { EmailTemplateService } from 'modules/mailing/services/email-template.service';
import { PostmarkMailingService } from 'modules/mailing/services/postmark-mailing.service';
import { LoggingModule } from 'modules/logging/logging.module';
import { MailingSaga } from 'modules/mailing/sagas/mailing.saga';
import { CreateTrialEndReminderCommandHandler } from 'modules/mailing/command-handlers/create-trial-end-reminder.command-handler';
import { NotifyTrialEndCommandHandler } from 'modules/mailing/command-handlers/notify-trial-end.command-handler';
/**
 * Array containing command handler classes for processing various commands.
 *
 * This collection includes:
 * - CreateTrialEndReminderCommandHandler: Handler for creating trial end reminders.
 * - NotifyTrialEndCommandHandler: Handler for notifying users of trial end.
 *
 * These handlers are responsible for executing specific actions related to trial end processes.
 *
 * @type {Array<Function>}
 * @constant
 */
const commandHandlers = [
  CreateTrialEndReminderCommandHandler,
  NotifyTrialEndCommandHandler,
];
/**
 * Module providing mailing functionalities.
 *
 * Imports:
 * - LoggingModule: Handles logging capabilities.
 *
 * Providers:
 * - MailingService: Core service for mailing operations.
 * - EmailTemplateService: Service for managing email templates.
 * - PostmarkMailingService: Service for sending emails via Postmark.
 * - RateLimiterWrapperFactoryService: Factory service for rate limiter wrappers.
 * - MailingSaga: Coordinating email dispatch processes.
 * - CommandHandlers: An array of command handler services related to mailing operations.
 *
 * Exports:
 * - MailingService: Accessible service for mailing operations.
 * - PostmarkMailingService: Accessible service for sending emails via Postmark.
 * - RateLimiterWrapperFactoryService: Accessible factory service for rate limiter wrappers.
 * - EmailTemplateService: Accessible service for managing email templates.
 */
@Module({
  imports: [LoggingModule],
  providers: [
    MailingService,
    EmailTemplateService,
    PostmarkMailingService,
    RateLimiterWrapperFactoryService,
    MailingSaga,
    ...commandHandlers,
  ],
  exports: [
    MailingService,
    PostmarkMailingService,
    RateLimiterWrapperFactoryService,
    EmailTemplateService,
  ],
})
export class MailingModule {}
