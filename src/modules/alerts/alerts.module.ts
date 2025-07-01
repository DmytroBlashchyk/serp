import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertRepository } from 'modules/alerts/repositories/alert.repository';
import { AlertsServices } from 'modules/alerts/services/alerts.services';
import { AlertsController } from 'modules/alerts/controllers/alerts.controller';
import { AlertKeywordViewRepository } from 'modules/alerts/repositories/alert-keyword-view.repository';
import { AlertSaga } from 'modules/alerts/sagas/alert.saga';
import { AlertViewCommandHandler } from 'modules/alerts/command-handlers/alert-view.command-handler';
import { AlertsByProjectResponseFactory } from 'modules/alerts/factories/alerts-by-project-response.factory';
import { AlertKeywordRepository } from 'modules/alerts/repositories/alert-keyword.repository';
import { AlertsByKeywordsResponseFactory } from 'modules/alerts/factories/alerts-by-keywords-response.factory';
import { AlertInfoResponseFactory } from 'modules/alerts/factories/alert-info-response.factory';
import { AlertKeywordsResponseFactory } from 'modules/alerts/factories/alert-keywords-response.factory';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { CreateAlertsCommandHandler } from 'modules/alerts/command-handlers/create-alerts.command-handler';
import { ProjectsModule } from 'modules/projects/projects.module';
import { TriggersModule } from 'modules/triggers/triggers.module';
import { ProjectAlertsToEmailsTransformer } from 'modules/alerts/transformers/project-alerts-to-emails.transformer';
import { KeywordsAlertsToEmailsTransformer } from 'modules/alerts/transformers/keywords-alerts-to-emails.transformer';
import { MailingModule } from 'modules/mailing/mailing.module';
import { AlertViewRepository } from 'modules/alerts/repositories/alert-view.repository';
import { CommonModule } from 'modules/common/common.module';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { LoggingModule } from 'modules/logging/logging.module';
import { KeywordsAlertsToEmailsForGoogleLocalTransformer } from 'modules/alerts/transformers/keywords-alerts-to-emails-for-google-local.transformer';
import { ProjectAlertsToEmailsForGoogleLocalTransformer } from 'modules/alerts/transformers/project-alerts-to-emails-for-google-local.transformer';
/**
 * Array containing instances of command handler classes.
 *
 * @type {Array<object>}
 * @property {object} 0 - Instance of AlertViewCommandHandler responsible for managing alert views.
 * @property {object} 1 - Instance of CreateAlertsCommandHandler responsible for creating alerts.
 */
const commandHandlers = [AlertViewCommandHandler, CreateAlertsCommandHandler];
/**
 * The AlertsModule class is a module in the application that handles
 * the management and processing of alerts. It integrates various other
 * modules and repositories required for the alert system to function.
 *
 * This module imports several feature modules and other application
 * modules, including:
 * - TypeOrmModule with repositories like AlertRepository, AlertKeywordViewRepository, AlertKeywordRepository, and AlertViewRepository
 * - KeywordsModule
 * - ProjectsModule
 * - TriggersModule
 * - MailingModule
 * - CommonModule
 * - AccountLimitsModule
 * - LoggingModule
 *
 * The providers of this module supply the necessary services, factories,
 * and transformers needed to process alerts:
 * - AlertsServices
 * - AlertSaga
 * - commandHandlers (an array of command handler instances)
 * - AlertsByProjectResponseFactory
 * - AlertsByKeywordsResponseFactory
 * - AlertInfoResponseFactory
 * - AlertKeywordsResponseFactory
 * - ProjectAlertsToEmailsTransformer
 * - KeywordsAlertsToEmailsTransformer
 * - KeywordsAlertsToEmailsForGoogleLocalTransformer
 * - ProjectAlertsToEmailsForGoogleLocalTransformer
 *
 * The controllers section registers the AlertsController to handle HTTP requests
 * related to alerts.
 *
 * The module exports the AlertSaga to be utilized in other parts of the application.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AlertRepository,
      AlertKeywordViewRepository,
      AlertKeywordRepository,
      AlertViewRepository,
    ]),
    KeywordsModule,
    ProjectsModule,
    TriggersModule,
    MailingModule,
    CommonModule,
    AccountLimitsModule,
    LoggingModule,
  ],
  providers: [
    AlertsServices,
    AlertSaga,
    ...commandHandlers,
    AlertsByProjectResponseFactory,
    AlertsByKeywordsResponseFactory,
    AlertInfoResponseFactory,
    AlertKeywordsResponseFactory,
    ProjectAlertsToEmailsTransformer,
    KeywordsAlertsToEmailsTransformer,
    KeywordsAlertsToEmailsForGoogleLocalTransformer,
    ProjectAlertsToEmailsForGoogleLocalTransformer,
  ],
  controllers: [AlertsController],
  exports: [AlertSaga],
})
export class AlertsModule {}
