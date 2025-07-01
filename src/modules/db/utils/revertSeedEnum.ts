import { QueryBuilder } from 'typeorm';

/**
 * Reverts the enumeration of seed data in the database by deleting entries matching the given names.
 *
 * @param {EntityType} entity - The entity type to be reverted.
 * @param {QueryBuilder<EntityType>} queryBuilder - The query builder used to execute the delete operation.
 * @param {Array<{name: string}>} data - An array of objects containing the names to be removed from the entity.
 * @return {Promise<void>} - A promise that resolves when the delete operation is complete.
 */
export async function revertSeedEnum<EntityType>(
  entity: EntityType,
  queryBuilder: QueryBuilder<EntityType>,
  data: Array<{ name: string }>,
) {
  await queryBuilder
    .delete()
    .from(entity as any)
    .where('name IN (:...names)', {
      names: data.map((en) => en.name),
    })
    .execute();
}
