import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { LoggingService } from 'modules/logging/services/logging.service';
import { HandleMonthlyKeywordUpdateType } from 'modules/gateway/types/handle-monthly-keyword-update.type';
import { HandleAdditionOfKeywordsType } from 'modules/gateway/types/handle-addition-of-keywords.type';
import { CardType } from 'modules/subscriptions/types/card.type';
import { PaymentMethodEntity } from 'modules/payments/entities/payment-method.entity';
import { CurrentUserResponse } from 'modules/users/responses/current-user.response';
import { BillingResponse } from 'modules/subscriptions/responses/billing.response';
import { FolderResponse } from 'modules/folders/responses/folder.response';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class GatewayService
  implements
    OnModuleInit,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  /**
   * Constructs an instance of the class.
   *
   * @param {LoggingService} loggingService - The logging service instance used for logging purposes.
   * @return {void}
   */
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Instance of the server that handles incoming connections and HTTP requests.
   *
   * @type {Server}
   */
  @WebSocketServer() server: Server;

  /**
   * Handles the user response by emitting a server event with the user's response data.
   *
   * @param {CurrentUserResponse} userResponse - An object containing the response data from the current user.
   * @return {Promise<void>} A Promise that resolves when the server event has been emitted.
   */
  async handleUserResponse(userResponse: CurrentUserResponse): Promise<void> {
    this.server.emit(`users/${userResponse.id}/user-response`, userResponse);
  }

  /**
   * Handles and emits the folder tree structure for a specific user and account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {IdType} userId - The unique identifier for the user.
   * @param {FolderResponse} folderTree - The folder tree to be handled and emitted.
   * @return {Promise<void>} - A promise that resolves when the folder tree has been successfully handled.
   */
  async handleFoldersTree(
    accountId: IdType,
    userId: IdType,
    folderTree: FolderResponse,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/users/${userId}/folder-tree`, {
      folderTree,
    });
  }

  /**
   * Handles the updated position for an account and emits the updated keywords.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {Array} keywords - An array of updated keywords.
   * @return {Promise<void>} - A promise that resolves when the updated keywords have been emitted.
   */
  async handleUpdatedPosition(
    accountId: IdType,
    keywords: any[],
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/updated-keywords`, keywords);
  }
  /**
   * Handles the update billing process for a specified account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {BillingResponse} data - The billing data to be updated.
   * @return {Promise<void>} - A promise that resolves when the billing update is complete.
   */
  async handleUpdateBilling(
    accountId: IdType,
    data: BillingResponse,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/update-billing`, {
      ...data,
    });
  }

  /**
   * Handles the change of a payment method for a given account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {CardType} card - The card details to be updated.
   * @param {PaymentMethodEntity} paymentMethod - The new payment method entity.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async handlePaymentMethodChange(
    accountId: IdType,
    card: CardType,
    paymentMethod: PaymentMethodEntity,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/update-payment-method`, {
      card,
      paymentMethod,
    });
  }

  /**
   * Handles the event to update all account limits for a given account.
   *
   * @param {IdType} accountId - The unique identifier of the account whose limits are being updated.
   * @return {Promise<void>} A promise that resolves when the limits update event has been emitted.
   */
  async handleUpdatedAllAccountLimits(accountId: IdType): Promise<void> {
    this.server.emit(`accounts/${accountId}/updated-all-account-limits`, {
      updateLimits: true,
    });
  }

  /**
   * Handles the remote projects associated with a specific account by
   * emitting an event with the provided project IDs.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {IdType[]} projectIds - A list of project IDs to be handled.
   * @return {Promise<void>} A promise that resolves once the event is emitted.
   */
  async handleRemoteProjects(
    accountId: IdType,
    projectIds: IdType[],
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/remote-projects`, {
      projectIds,
    });
  }

  /**
   * Handles the event to update the number of projects associated with an account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {number} accountLimitUsed - The number of projects currently used by the account.
   * @return {Promise<void>} The function returns a Promise that resolves when the event is emitted successfully.
   */
  async handleNumberOfAccountProjects(
    accountId: IdType,
    accountLimitUsed: number,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/number-of-account-projects`, {
      accountLimitUsed,
    });
  }

  /**
   * Handles the addition of email reports by emitting an event with the relevant account information.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {number} accountLimitUsed - The amount of the account limit that has been used.
   * @param {number} balanceAccountLimit - The remaining balance of the account limit.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async handleAdditionOfEmailReports(
    accountId: IdType,
    accountLimitUsed: number,
    balanceAccountLimit: number,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/addition-of-email-reports`, {
      accountLimitUsed,
      balanceAccountLimit,
    });
  }

  /**
   * Handles the addition of triggers for a given account by emitting an event to the server.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} accountLimitUsed - The amount of the account limit that has been used.
   * @param {number} balanceAccountLimit - The remaining balance of the account limit.
   * @return {Promise<void>} A promise that resolves when the event has been emitted.
   */
  async handleAdditionOfTriggers(
    accountId: IdType,
    accountLimitUsed: number,
    balanceAccountLimit: number,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/addition-of-triggers`, {
      accountLimitUsed,
      balanceAccountLimit,
    });
  }

  /**
   * Handles the addition of users by emitting an event with the updated account limit usage
   * and the balance of the account limit.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {number} accountLimitUsed - The current amount of the account limit that has been used.
   * @param {number} balanceAccountLimit - The remaining balance of the account limit.
   *
   * @return {Promise<void>} - Returns a promise that resolves once the event has been emitted.
   */
  async handleAdditionOfUsers(
    accountId: IdType,
    accountLimitUsed: number,
    balanceAccountLimit: number,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/addition-of-users`, {
      accountLimitUsed,
      balanceAccountLimit,
    });
  }

  /**
   * Handles the addition of invitations for a given account by emitting an event with the current account limit used.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} accountLimitUsed - The current number of used invitations within the account limits.
   * @return {Promise<void>} A promise that resolves when the event has been emitted.
   */
  async handleAdditionOfInvitations(
    accountId: IdType,
    accountLimitUsed: number,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/addition-of-invitations`, {
      accountLimitUsed,
    });
  }

  /**
   * Handles the addition of shared links for a specific account by emitting a server event.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} accountLimitUsed - The amount of the account limit that has been used.
   * @param {number} balanceAccountLimit - The remaining balance of the account limit.
   * @return {Promise<void>} A promise that resolves when the event has been emitted.
   */
  async handleAdditionOfSharedLinks(
    accountId: IdType,
    accountLimitUsed: number,
    balanceAccountLimit: number,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/addition-of-shared-links`, {
      accountLimitUsed,
      balanceAccountLimit,
    });
  }

  /**
   * Handles the addition of competitors for a specific account.
   *
   * @param {IdType} accountId - The ID of the account for which competitors are being added.
   * @param {number} accountLimitUsed - The amount of the account limit that has been used.
   * @param {number} balanceAccountLimit - The remaining balance of the account limit.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async handleAdditionOfCompetitors(
    accountId: IdType,
    accountLimitUsed: number,
    balanceAccountLimit: number,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/addition-of-competitors`, {
      accountLimitUsed,
      balanceAccountLimit,
    });
  }

  /**
   * Handles the addition of notes for a given account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {number} accountLimitUsed - The amount of the account limit that has been used.
   * @param {number} balanceAccountLimit - The remaining balance of the account limit.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async handleAdditionOfNotes(
    accountId: IdType,
    accountLimitUsed: number,
    balanceAccountLimit: number,
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/addition-of-notes`, {
      accountLimitUsed,
      balanceAccountLimit,
    });
  }

  /**
   * Handles the update of monthly keyword metrics and emits the update to the specified account.
   *
   * @param {HandleMonthlyKeywordUpdateType} payload - Object containing the account information and metrics to update.
   * @param {number} payload.accountId - The ID of the account that is being updated.
   * @param {number} payload.accountLimitUsed - The usage of the account limit that is being reported.
   * @param {string} payload.balanceAccountLimit - The remaining balance of the account limit in string format.
   *
   * @return {Promise<void>} A promise that resolves when the update has been handled and emitted.
   */
  async handleMonthlyKeywordUpdate(
    payload: HandleMonthlyKeywordUpdateType,
  ): Promise<void> {
    this.server.emit(`accounts/${payload.accountId}/monthly-keyword-update`, {
      accountLimitUsed: payload.accountLimitUsed,
      balanceAccountLimit: Number(payload.balanceAccountLimit),
    });
  }

  /**
   * Handles the addition of keywords by emitting an event with the updated account limits.
   *
   * @param {HandleAdditionOfKeywordsType} payload - The payload containing account details and limits.
   * @param {number} payload.accountId - The ID of the account for which keywords are being added.
   * @param {number} payload.accountLimitUsed - The amount of account limit used.
   * @param {string} payload.balanceAccountLimit - The remaining account limit.
   * @return {Promise<void>} - A promise that resolves when the event is emitted.
   */
  async handleAdditionOfKeywords(
    payload: HandleAdditionOfKeywordsType,
  ): Promise<void> {
    this.server.emit(`accounts/${payload.accountId}/addition-of-keywords`, {
      accountLimitUsed: payload.accountLimitUsed,
      balanceAccountLimit: Number(payload.balanceAccountLimit),
    });
  }

  /**
   * Handles the graphics update for a set of projects associated with a given account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {IdType[]} projectIds - An array of unique identifiers for the projects.
   * @return {Promise<void>} A promise that resolves when the process is complete.
   */
  async handleProjectGraphics(
    accountId: IdType,
    projectIds: IdType[],
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/update-project-graphics`, {
      projectIds,
    });
  }

  /**
   * Handles the start of a keyword update process by emitting an event.
   *
   * @param {IdType} accountId - The ID of the account for which the keyword update is starting.
   * @param {IdType[]} keywordIds - An array of keyword IDs that are being updated.
   * @return {Promise<void>} A promise representing the completion of the event emission.
   */
  async handleStartOfKeywordUpdate(
    accountId: IdType,
    keywordIds: IdType[],
  ): Promise<void> {
    this.server.emit(
      `accounts/${accountId}/start-of-keyword-update`,
      keywordIds,
    );
  }

  /**
   * Handles the update for projects associated with a specific account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {any[]} projects - The list of projects to be updated.
   * @return {Promise<void>} A promise that resolves when the update is complete.
   */
  async handleUpdateProjects(
    accountId: IdType,
    projects: any[],
  ): Promise<void> {
    this.server.emit(`accounts/${accountId}/updated-projects`, projects);
  }

  /**
   * Handles updating the password of a shared link.
   *
   * @param {string} sharedLink - The shared link for which the password is being updated.
   * @return {Promise<void>} - A promise that resolves once the password has been updated.
   */
  async handleUpdateSharedLinkPassword(
    @MessageBody() sharedLink: string,
  ): Promise<void> {
    this.server.emit('updated-shared-link-password', { sharedLink });
  }

  /**
   * Method to perform actions after server initialization.
   *
   * @param {any} server - The server instance that has been initialized.
   * @return {any} - The result of the logging operation.
   */
  afterInit(server: any): any {
    this.loggingService.log('afterInit', server);
  }

  /**
   * Handles the connection for a given client.
   *
   * @param {Socket} client - The client socket that has connected.
   * @return {any} The result of the connection handling process.
   */
  handleConnection(client: Socket): any {
    this.loggingService.log('Connected');
    this.loggingService.log(client);
  }

  /**
   * Handles the disconnection of a client.
   *
   * @param {Socket} client - The client socket that has disconnected.
   * @return {void}
   */
  handleDisconnect(client: Socket): any {
    this.loggingService.log('Disconnect');
    this.loggingService.log(client);
  }

  /**
   * Initializes the module by setting up a 'connection' event listener on the server.
   * When a connection is established, logs the connection event along with the socket ID.
   *
   * @return {any} The result of adding the event listener.
   */
  onModuleInit(): any {
    this.server.on('connection', (socket) => {
      this.loggingService.log('Connected', `SocketId: ${socket.id}`);
    });
  }
}
