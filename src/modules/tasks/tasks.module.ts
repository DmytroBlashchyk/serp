import { Module } from '@nestjs/common';
import { TasksService } from 'modules/tasks/services/tasks.service';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { EmailReportsModule } from 'modules/email-reports/email-reports.module';
import { SubscriptionsModule } from 'modules/subscriptions/subscriptions.module';
import { ProjectsModule } from 'modules/projects/projects.module';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { CountriesModule } from 'modules/countries/countries.module';

/**
 * The TasksModule is responsible for managing and orchestrating tasks
 * within the application. It imports and interacts with multiple other
 * modules to provide a cohesive task management system. The functionality
 * provided by this module is supported by the TasksService.
 *
 * Imported Modules:
 * - AccountsModule: Manages account-related operations.
 * - KeywordsModule: Handles keyword-related functionalities.
 * - EmailReportsModule: Manages the generation and sending of email reports.
 * - SubscriptionsModule: Deals with subscription management.
 * - ProjectsModule: Manages project-related tasks.
 * - AccountLimitsModule: Handles account limit constraints and checks.
 *
 * Providers:
 * - TasksService: The primary service that contains the business logic for
 *   task management in the application.
 */
@Module({
  imports: [
    AccountsModule,
    KeywordsModule,
    EmailReportsModule,
    SubscriptionsModule,
    ProjectsModule,
    AccountLimitsModule,
    CountriesModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
