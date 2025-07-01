import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { InvitationsService } from 'modules/invitations/services/invitations.service';
import { InvitationsController } from 'modules/invitations/controllers/invitations.controller';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { UsersModule } from 'modules/users/users.module';
import { FoldersModule } from 'modules/folders/folders.module';
import { ProjectsModule } from 'modules/projects/projects.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from 'modules/queue/enums/queues.enum';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { InvitationResponseFactory } from 'modules/invitations/factories/invitation-response.factory';
import { InvitedUserResponseFactory } from 'modules/invitations/factories/invited-user-response.factory';
import { InvitationsSaga } from 'modules/invitations/sagas/invitations.saga';
import { AssignProjectToAFolderManagerCommandHandler } from 'modules/invitations/command-handlers/assign-project-to-a-folder-manager.command-handler';
import { LoggingModule } from 'modules/logging/logging.module';
import { AssigningAChildFolderToParentFolderManagerCommandHandler } from 'modules/invitations/command-handlers/assigning-a-child-folder-to-parent-folder-manager.command-handler';
import { CqrsModule } from '@nestjs/cqrs';
/**
 * Array of command handler classes responsible for handling specific command actions in the application.
 *
 * Each handler in this array is designed to process a particular type of command, providing the necessary logic
 * required for that command's execution. This modular approach improves code maintainability and scalability,
 * allowing for easier management of diverse command types.
 *
 * The handlers included in this array are:
 * - AssignProjectToAFolderManagerCommandHandler: Handles the assignment of a project to a folder.
 * - AssigningAChildFolderToParentFolderManagerCommandHandler: Handles the assignment of a child folder to a parent folder.
 */
const commandHandlers = [
  AssignProjectToAFolderManagerCommandHandler,
  AssigningAChildFolderToParentFolderManagerCommandHandler,
];
/**
 * The InvitationsModules class is an organizational unit within the application that encapsulates
 * all the elements related to managing invitations. This module imports various other modules
 * necessary for its functionality, establishes connections to databases and messaging queues,
 * provides services and controllers involved in the invitations process, and manages exports for
 * use in other parts of the application.
 *
 * @module InvitationsModules
 * @requires AccountsModule
 * @requires AccountLimitsModule
 * @requires UsersModule
 * @requires FoldersModule
 * @requires ProjectsModule
 * @requires CqrsModule
 * @requires TypeOrmModule
 * @requires BullModule
 * @requires ConfigModule
 * @requires LoggingModule
 * @requires InvitationsService
 * @requires InvitationResponseFactory
 * @requires InvitedUserResponseFactory
 * @requires InvitationsSaga
 * @requires commandHandlers
 * @requires InvitationsController
 */
@Module({
  imports: [
    AccountsModule,
    AccountLimitsModule,
    UsersModule,
    FoldersModule,
    ProjectsModule,
    CqrsModule,
    TypeOrmModule.forFeature([InvitationRepository]),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Mailing,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
    LoggingModule,
  ],
  providers: [
    InvitationsService,
    InvitationResponseFactory,
    InvitedUserResponseFactory,
    InvitationsSaga,
    ...commandHandlers,
  ],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModules {}
