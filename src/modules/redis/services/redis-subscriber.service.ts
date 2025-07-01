import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { KeywordRankingsResponseFactory } from 'modules/keywords/factories/keyword-rankings-response.factory';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { GetPaginatedProjectsAvailableToUserTypeResponseFactory } from 'modules/projects/factories/get-paginated-projects-available-to-user-type-response.factory';
import { HandleAdditionOfKeywordsType } from 'modules/gateway/types/handle-addition-of-keywords.type';
import { HandleMonthlyKeywordUpdateType } from 'modules/gateway/types/handle-monthly-keyword-update.type';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

/**
 * Service for subscribing to Redis channels and handling incoming messages.
 *
 * This service uses a Redis client to subscribe to specific channels and processes
 * the messages received from those channels appropriately.
 *
 * The service initializes the Redis client with the configuration settings from
 * the ConfigService and sets up message handling for the subscribed channels.
 *
 * Handles messages related to:
 * - Project graphics updates
 * - Updated positions
 * - Project updates
 * - Keyword additions
 * - Monthly keyword updates
 *
 * Dependencies are injected via the constructor.
 * - ConfigService: Provides configuration settings.
 * - GatewayService: Processes different types of updates received via Redis.
 * - KeywordRankingsResponseFactory: Creates responses related to keyword rankings.
 * - GetPaginatedProjectsAvailableToUserTypeResponseFactory: Creates responses for paginated projects available to a user.
 * - CliLoggingService: Logs errors and other information to the CLI.
 */
@Injectable()
export class RedisSubscriberService implements OnModuleInit {
  private client: RedisClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly gatewayService: GatewayService,
    private readonly keywordRankingsResponseFactory: KeywordRankingsResponseFactory,
    private readonly getPaginatedProjectsAvailableToUserTypeResponseFactory: GetPaginatedProjectsAvailableToUserTypeResponseFactory,
    private readonly cliLoggingService: CliLoggingService,
  ) {
    this.client = createClient({
      host: configService.get(ConfigEnvEnum.REDIS_HOST),
      port: +configService.get(ConfigEnvEnum.REDIS_PORT),
    });

    this.client.on('error', (err) => {
      cliLoggingService.error('Error: RedisSubscriberService', err);
    });
  }

  /**
   * Initializes module by subscribing to various channels and setting up message handlers.
   *
   * This method subscribes to several message channels related to project graphics, position updates, project updates,
   * keyword additions, and monthly keyword updates. When a message on these channels is received, the corresponding handler
   * is invoked to process the message.
   *
   * @return {void}
   */
  onModuleInit() {
    this.client.subscribe('update-project-graphics');
    this.client.subscribe('handle-updated-position');
    this.client.subscribe('handle-update-projects');
    this.client.subscribe('addition-of-keywords');
    this.client.subscribe('monthly-keyword-update');
    this.client.on('message', (channel, message) => {
      if (channel === 'update-project-graphics') {
        this.handleUpdateProjectGraphics(JSON.parse(message));
      }
      if (channel === 'handle-updated-position') {
        this.handleUpdatedPosition(JSON.parse(message));
      }
      if (channel === 'handle-update-projects') {
        this.handleUpdateProjects(JSON.parse(message));
      }
      if (channel === 'addition-of-keywords') {
        this.handleAdditionOfKeywords(JSON.parse(message));
      }
      if (channel === 'monthly-keyword-update') {
        this.handleMonthlyKeywordUpdate(JSON.parse(message));
      }
    });
  }

  /**
   * Handles the monthly update of keywords using the provided message.
   *
   * @param {HandleMonthlyKeywordUpdateType} message - The message containing data needed for the keyword update.
   * @return {Promise<void>} A promise that resolves when the monthly keyword update is complete.
   */
  async handleMonthlyKeywordUpdate(
    message: HandleMonthlyKeywordUpdateType,
  ): Promise<void> {
    await this.gatewayService.handleMonthlyKeywordUpdate({ ...message });
  }

  /**
   * Handles the addition of keywords by forwarding the message to the gateway service.
   *
   * @param {HandleAdditionOfKeywordsType} message - The message containing keywords to be added.
   * @return {Promise<void>} A promise that resolves when the keywords have been successfully handled.
   */
  async handleAdditionOfKeywords(
    message: HandleAdditionOfKeywordsType,
  ): Promise<void> {
    await this.gatewayService.handleAdditionOfKeywords({ ...message });
  }

  /**
   * Handles the update of projects by fetching a paginated response and sending it to the gateway service for further processing.
   *
   * @param {any} message - The message containing the project information and account ID.
   * @return {Promise<void>} A promise that resolves when the operations are completed.
   */
  async handleUpdateProjects(message: any): Promise<void> {
    const data =
      await this.getPaginatedProjectsAvailableToUserTypeResponseFactory.createResponse(
        message.projects,
        {
          meta: undefined,
          dailyAverage: BooleanEnum.TRUE,
        },
      );
    await this.gatewayService.handleUpdateProjects(
      message.accountId,
      data.items,
    );
  }

  /**
   * Processes the updated position from the given message, creates a response for each item,
   * and sends the updated position to the gateway service.
   *
   * @param {any} message - The message containing result items with updated positions.
   * @return {Promise<void>} - A promise that resolves when the updated positions have been handled.
   */
  async handleUpdatedPosition(message: any): Promise<void> {
    const items = [];
    let accountId;
    for (const item of message.result) {
      accountId = item.account_id;
      if (accountId) {
        const data = await this.keywordRankingsResponseFactory.createResponse([
          item,
        ]);
        items.push({ ...data.items[0] });
      }
    }

    await this.gatewayService.handleUpdatedPosition(accountId, items);
  }

  /**
   * Handles the update of project graphics.
   *
   * @param {any} message - The message object containing accountId and projectIds.
   * @return {Promise<void>} - A promise that resolves when the graphics have been updated.
   */
  async handleUpdateProjectGraphics(message: any): Promise<void> {
    await this.gatewayService.handleProjectGraphics(
      message.accountId,
      message.projectIds,
    );
  }
}
