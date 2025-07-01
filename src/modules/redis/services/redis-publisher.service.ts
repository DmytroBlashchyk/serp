import { Injectable } from '@nestjs/common';
import { createClient, RedisClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@Injectable()
export class RedisPublisherService {
  private client: RedisClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly cliLoggingService: CliLoggingService,
  ) {
    this.client = createClient({
      host: configService.get(ConfigEnvEnum.REDIS_HOST),
      port: +configService.get(ConfigEnvEnum.REDIS_PORT),
    });

    this.client.on('error', (err) => {
      cliLoggingService.error('Error: RedisPublisherService', err);
    });
  }

  /**
   * Publishes a message to a specified channel.
   *
   * @param {string} channel - The name of the channel to which the message will be published.
   * @param {any} message - The message to be published. It will be serialized to a JSON string.
   * @returns {Promise<void>} A promise that resolves when the message has been successfully published.
   */
  async publish(channel: string, message: any): Promise<void> {
    this.client.publish(channel, JSON.stringify(message));
  }

  /**
   * Stores a key-value pair in the Redis datastore.
   *
   * @param {string} key - The key under which the value should be stored.
   * @param {string} value - The value to store.
   * @return {Promise<void>} - A Promise that resolves when the key-value pair is successfully stored.
   */
  async set(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, (err) => {
        if (err) {
          this.cliLoggingService.error(
            'Error setting key in Redis',
            err.message,
          );
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * Deletes a key from the Redis database.
   *
   * @param {string} key - The key to be deleted from the Redis database.
   * @return {Promise<void>} A promise that resolves when the key is successfully deleted.
   */
  async del(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) {
          this.cliLoggingService.error(
            'Error deleting key in Redis',
            err.message,
          );
          return reject(err);
        }
        resolve();
      });
    });
  }
}
