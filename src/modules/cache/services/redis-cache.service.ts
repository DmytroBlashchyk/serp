import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Retrieves a value from the cache corresponding to the provided key.
   *
   * @param {string} key - The key of the cached item to retrieve.
   * @return {Promise<unknown>} A promise that resolves to the cached value.
   */
  async get(key: string): Promise<unknown> {
    return await this.cacheManager.get(key);
  }

  // If using cache-manager v4, provide ttl in seconds
  // If using cache-manager v5, provide ttl in milliseconds
  // cache-manager v4 is used in the project
  /**
   * Stores a value in the cache with a specified key and time-to-live (TTL).
   *
   * @param {string} key - The key under which the value should be stored.
   * @param {unknown} value - The value to be stored.
   * @param {number} [ttl=3600] - Optional. The time-to-live (TTL) in seconds for the cached item.
   * @return {Promise<void>} A promise that resolves when the value is successfully stored.
   */
  async set(key: string, value: unknown, ttl = 3600): Promise<void> {
    await this.cacheManager.set(key, value, { ttl });
  }

  /**
   * Deletes a value from the cache based on the provided key.
   *
   * @param {string} key - The key associated with the value to be deleted from the cache.
   * @return {Promise<void>} A promise that resolves once the value has been deleted.
   */
  async delete(key: string) {
    await this.cacheManager.del(key);
  }

  /**
   * Asynchronously sets multiple key-value pairs with optional time-to-live (TTL).
   *
   * @param {Object[]} keyValuePairs - An array of objects, each containing a key, value, and optional TTL.
   * @param {string} keyValuePairs[].key - The key to set.
   * @param {unknown} keyValuePairs[].value - The value to associate with the key.
   * @param {number} [keyValuePairs[].ttl] - Optional time-to-live in milliseconds for the key-value pair.
   * @return {Promise<void>} A promise that resolves when all key-value pairs have been set.
   */
  async multipleSet(
    keyValuePairs: { key: string; value: unknown; ttl?: number }[],
  ): Promise<void> {
    const promises = keyValuePairs.map(async ({ key, value, ttl }) => {
      await this.set(key, value, ttl);
    });
    await Promise.all(promises);
  }

  /**
   * Retrieves multiple values associated with an array of keys.
   *
   * @param {string[]} keys - An array of keys whose associated values need to be retrieved.
   * @return {Promise<{ [key: string]: unknown }>} A promise that resolves to an object containing key-value pairs.
   */
  async getMultiple(keys: string[]): Promise<{ [key: string]: unknown }> {
    const values = await Promise.all(keys.map((key) => this.get(key)));
    return keys.reduce((acc: any, key, index) => {
      acc[key] = values[index];
      return acc;
    }, {});
  }

  /**
   * Deletes multiple items identified by their keys.
   *
   * @param {string[]} keys - Array of keys representing the items to be deleted.
   * @return {Promise<void>} Promise that resolves when all items are deleted.
   */
  async deleteMultiple(keys: string[]): Promise<void> {
    const promises = keys.map((key) => this.delete(key));
    await Promise.all(promises);
  }

  /**
   * Deletes all cache entries that have keys starting with the specified prefix.
   *
   * @param {string} prefix - The prefix of the keys to delete from the cache.
   * @return {Promise<void>} - A promise that resolves when the deletion is complete.
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    const cacheManagerStore = this.cacheManager.store;
    if (cacheManagerStore && typeof cacheManagerStore.keys === 'function') {
      const keys = await cacheManagerStore.keys(`${prefix}*`);
      if (keys.length > 0) {
        await this.cacheManager.del(keys);
      }
    } else {
      throw new Error('Cache store does not support key listing.');
    }
  }

  // Method to get all keys matching a pattern
  /**
   * Retrieves a list of keys from the cache that match the specified pattern.
   *
   * @param {string} pattern - The pattern to match keys against.
   * @return {Promise<string[]>} A promise that resolves to an array of keys matching the pattern.
   * @throws {Error} If the cache store does not support key listing.
   */
  async keys(pattern: string): Promise<string[]> {
    const cacheManagerStore = this.cacheManager.store;

    if (cacheManagerStore && typeof cacheManagerStore.keys === 'function') {
      return await cacheManagerStore.keys(pattern);
    } else {
      throw new Error('Cache store does not support key listing.');
    }
  }

  /**
   * Removes the specified value from the given array.
   *
   * @param {IdType[]} array - The array from which the value will be removed.
   * @param {IdType} valueToRemove - The value to be removed from the array.
   * @return {Promise<IdType[]>} - A promise that resolves to a new array with the specified value removed.
   */
  async removeValue(array: IdType[], valueToRemove: IdType): Promise<IdType[]> {
    return array.filter((item) => item !== valueToRemove);
  }
}
