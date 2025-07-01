import { Module } from '@nestjs/common';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { EmailReportsController } from 'modules/email-reports/controllers/email-reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailReportRepository } from 'modules/email-reports/repositories/email-report.repository';
import { RetortTypeRepository } from 'modules/email-reports/repositories/retort-type.repository';
import { EmailReportFrequencyRepository } from 'modules/email-reports/repositories/email-report-frequency.repository';
import { ReportDeliveryTimeRepository } from 'modules/email-reports/repositories/report-delivery-time.repository';
import { ProjectsModule } from 'modules/projects/projects.module';
import { ReportRecipientRepository } from 'modules/email-reports/repositories/report-recipient.repository';
import { EmailReportsRequestFactory } from 'modules/email-reports/factories/email-reports-request.factory';
import { EmailReportFrequencyController } from 'modules/email-reports/controllers/email-report-frequency.controller';
import { ReportDeliveryTimesController } from 'modules/email-reports/controllers/report-delivery-times.controller';
import { ReportTypesController } from 'modules/email-reports/controllers/report-types.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SendCsvEmailReportCommandHandler } from 'modules/email-reports/command-handlers/send-csv-email-report.command-handler';
import { SendCsvEmailReportSaga } from 'modules/email-reports/sagas/send-csv-email-report.saga';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { CsvService } from 'modules/email-reports/services/csv.service';
import { MailingModule } from 'modules/mailing/mailing.module';
import { CsvEmailReportTransformer } from 'modules/email-reports/transformers/csv-email-report.transformer';
import { EmailReportToPdfController } from 'modules/email-reports/controllers/email-report-to-pdf.controller';
import { SendPdfEmailReportSaga } from 'modules/email-reports/sagas/send-pdf-email-report.saga';
import { SendPdfEmailReportCommandHandler } from 'modules/email-reports/command-handlers/send-pdf-email-report.command-handler';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { SubscriptionsModule } from 'modules/subscriptions/subscriptions.module';
import { LoggingModule } from 'modules/logging/logging.module';
import { DeviceTypesModule } from 'modules/device-types/device-types.module';
import { DataForPdfResponseFactory } from 'modules/email-reports/factories/data-for-pdf-response.factory';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { TagsModule } from 'modules/tags/tags.module';
import { EmailReportWebhookController } from 'modules/email-reports/controllers/email-report-webhook.controller';
import { EmailReportWebhookService } from 'modules/email-reports/services/email-report-webhook.service';
import { HandleEmailReportBounceWebhookCommandHandler } from 'modules/email-reports/command-handlers/handle-email-report-bounce-webhook.command-handler';
import { HandleEmailReportBounceWebhookSaga } from 'modules/email-reports/sagas/handle-email-report-bounce-webhook.saga';

/**
 * An array of command handler classes that handle different types of email report commands.
 *
 * Each handler in the array is responsible for processing and executing specific types of email report commands.
 * - `SendCsvEmailReportCommandHandler`: Handles commands for sending CSV email reports.
 * - `SendPdfEmailReportCommandHandler`: Handles commands for sending PDF email reports.
 *
 * This array is used to register all available command handlers for email report processing.
 */
const commandHandlers = [
  SendCsvEmailReportCommandHandler,
  SendPdfEmailReportCommandHandler,
  HandleEmailReportBounceWebhookCommandHandler,
];

/**
 * The `EmailReportsModule` class is responsible for encapsulating the configurations,
 * providers, controllers, and dependencies related to generating and managing email reports.
 * It utilizes various repositories, services, and other modules to fulfill its functionality.
 *
 * Imports:
 * - TypeOrmModule: Provides the feature-specific repositories.
 * - SubscriptionsModule: Manages subscription-related functionalities.
 * - ProjectsModule: Handles project-specific operations.
 * - CqrsModule: Integrates Command Query Responsibility Segregation (CQRS) pattern.
 * - KeywordsModule: Manages keyword-related operations.
 * - MailingModule: Handles mailing services.
 * - AccountLimitsModule: Manages account limits functionalities.
 * - AccountsModule: Manages account-related operations.
 * - LoggingModule: Provides logging capabilities.
 * - DeviceTypesModule: Manages device type operations.
 *
 * Providers:
 * - EmailReportsService: Main service for handling email reports.
 * - EmailReportsRequestFactory: Factory for creating email report requests.
 * - DataForPdfResponseFactory: Factory for creating PDF response data.
 * - SendCsvEmailReportSaga: Saga for sending CSV email reports.
 * - SendPdfEmailReportSaga: Saga for sending PDF email reports.
 * - CsvService: Service for handling CSV operations.
 * - CsvEmailReportTransformer: Transformer for CSV email reports.
 * - Command Handlers: A spread operator for including multiple command handlers.
 *
 * Controllers:
 * - EmailReportsController: Controller for managing email report operations.
 * - EmailReportFrequencyController: Controller for managing email report frequency.
 * - ReportDeliveryTimesController: Controller for managing report delivery times.
 * - ReportTypesController: Controller for managing report types.
 * - EmailReportToPdfController: Controller for managing email report to PDF conversions.
 *
 * Exports:
 * - EmailReportsService: The exported service related to email reports to be used by other modules.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailReportRepository,
      RetortTypeRepository,
      EmailReportFrequencyRepository,
      ReportDeliveryTimeRepository,
      ReportRecipientRepository,
    ]),
    SubscriptionsModule,
    ProjectsModule,
    CqrsModule,
    KeywordsModule,
    MailingModule,
    AccountLimitsModule,
    AccountsModule,
    LoggingModule,
    DeviceTypesModule,
    TagsModule,
  ],
  providers: [
    EmailReportsService,
    EmailReportsRequestFactory,
    DataForPdfResponseFactory,
    SendCsvEmailReportSaga,
    SendPdfEmailReportSaga,
    HandleEmailReportBounceWebhookSaga,
    ...commandHandlers,
    CsvService,
    CsvEmailReportTransformer,
    EmailReportWebhookService,
  ],
  controllers: [
    EmailReportsController,
    EmailReportFrequencyController,
    ReportDeliveryTimesController,
    ReportTypesController,
    EmailReportToPdfController,
    EmailReportWebhookController,
  ],
  exports: [EmailReportsService],
})
export class EmailReportsModule {}
