import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { BaseResponse } from 'modules/common/responses/base.response';

/**
 * Abstract factory class for creating response objects.
 *
 * This class is designed to be extended by specific response factory
 * implementations that handle the creation of response objects from entities.
 *
 * @template E - The type of the entity, which can be a subclass of BaseEntity
 *               or a generic record object.
 * @template R - The type of the response object that this factory will create.
 * @template Options - The type of the options object, which can provide additional
 *                     parameters to customize the response creation process.
 */
export abstract class BaseResponseFactory<
  E extends BaseEntity | Record<string, any>,
  R extends BaseResponse,
  Options extends Record<string, unknown> = Record<string, unknown> | any,
> {
  abstract createResponse(entity: E, options?: Options): R | Promise<R>;
}
