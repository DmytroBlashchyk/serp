import { QueryBuilder } from 'typeorm';

/**
 * Represents the type of an entity within the application.
 * An `EntityType` can include various classifications, such as "Person", "Organization", "Device", etc.
 * This classification helps in determining the behaviors and characteristics associated with the entity.
 * Typically used as a property within models that define entities.
 * This helps in categorizing and distinguishing diverse entities efficiently.
 *
 * **Example values**:
 * - `Person`
 * - `Organization`
 * - `Device`
 *
 * It's essential for ensuring that entities are correctly handled within different contexts of the application.
 */
export async function applySeedEnum<EntityType>(
  entity: EntityType,
  queryBuilder: QueryBuilder<EntityType>,
  data: Array<EntityType>,
) {
  await queryBuilder
    .insert()
    .into(entity as any)
    .values(data)
    .execute();
}
