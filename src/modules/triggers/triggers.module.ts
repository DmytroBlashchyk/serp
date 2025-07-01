import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriggerTypeRepository } from 'modules/triggers/repositories/trigger-type.repository';
import { TriggerRepository } from 'modules/triggers/repositories/trigger.repository';
import { TriggersService } from 'modules/triggers/services/triggers.service';
import { TriggersController } from 'modules/triggers/controllers/triggers.controller';
import { TriggerRuleRepository } from 'modules/triggers/repositories/trigger-rule.repository';
import { TriggerTypesController } from 'modules/triggers/controllers/trigger-types.controller';
import { TriggerTypesService } from 'modules/triggers/services/trigger-types.service';
import { TriggerRulesService } from 'modules/triggers/services/trigger-rules.service';
import { TriggerRulesController } from 'modules/triggers/controllers/trigger-rules.controller';
import { ProjectsModule } from 'modules/projects/projects.module';
import { TriggerRecipientRepository } from 'modules/triggers/repositories/trigger-recipient.repository';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { TriggerKeywordRepository } from 'modules/triggers/repositories/trigger-keyword.repository';
import { TriggersByKeywordsResponseFactory } from 'modules/triggers/factories/triggers-by-keywords-response.factory';
import { CreateTriggerWithKeywordsCommandHandlers } from 'modules/triggers/command-handlers/create-trigger-with-keywords.command-handlers';
import { TriggersSaga } from 'modules/triggers/sagas/triggers.saga';
import { CqrsModule } from '@nestjs/cqrs';
import { TriggerRecipientsController } from 'modules/triggers/controllers/trigger-recipients.controller';
import { TriggerRecipientsService } from 'modules/triggers/services/trigger-recipients.service';
import { SubscriptionsModule } from 'modules/subscriptions/subscriptions.module';
import { CreateTriggerInitializationCommandHandler } from 'modules/triggers/command-handlers/create-trigger-initialization.command-handler';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { LoggingModule } from 'modules/logging/logging.module';
/**
 * An array of command handler classes used in application to
 * register and manage different types of commands.
 *
 * This array includes:
 * - `CreateTriggerWithKeywordsCommandHandlers`: Handles commands related to creating triggers with specific keywords.
 * - `CreateTriggerInitializationCommandHandler`: Manages commands for initializing trigger creation.
 */
const commandHandlers = [
  CreateTriggerWithKeywordsCommandHandlers,
  CreateTriggerInitializationCommandHandler,
];
/**
 * The TriggersModule class is responsible for managing trigger-related components
 * within the application. This module integrates various repositories, services,
 * controllers, and other necessary modules to facilitate the handling and
 * processing of triggers.
 *
 * This Module:
 * - Imports required feature repositories using TypeOrmModule.
 * - Imports several other modules such as ProjectsModule, KeywordsModule, etc.
 * - Provides various services related to triggers, including TriggersService,
 *   TriggerTypesService, TriggerRulesService, among others.
 * - Registers several controllers like TriggersController, TriggerTypesController,
 *   TriggerRulesController, and TriggerRecipientsController.
 * - Exports essential services and TypeOrmModule for TriggerRepository for
 *   external use.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TriggerTypeRepository,
      TriggerRepository,
      TriggerRuleRepository,
      TriggerRecipientRepository,
      TriggerKeywordRepository,
    ]),
    ProjectsModule,
    KeywordsModule,
    CqrsModule,
    SubscriptionsModule,
    AccountLimitsModule,
    LoggingModule,
  ],
  providers: [
    TriggersService,
    TriggerTypesService,
    TriggerRulesService,
    TriggersByKeywordsResponseFactory,
    ...commandHandlers,
    TriggersSaga,
    TriggerRecipientsService,
  ],
  controllers: [
    TriggersController,
    TriggerTypesController,
    TriggerRulesController,
    TriggerRecipientsController,
  ],
  exports: [TriggersService, TypeOrmModule.forFeature([TriggerRepository])],
})
export class TriggersModule {}
