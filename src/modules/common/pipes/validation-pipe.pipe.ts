import {
  PipeTransform,
  ArgumentMetadata,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Environments } from 'modules/common/enums/environments.enum';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  /**
   * Transforms the given value based on the metadata and performs validation.
   *
   * @param {unknown} value - The value that needs to be transformed and validated.
   * @param {ArgumentMetadata} metadata - The metadata containing the type information.
   * @return {Promise<unknown>} - Returns the transformed and validated object if no errors.
   * @throws {HttpException} - Throws an HTTP exception if validation fails, with a message and the validation errors.
   */
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.needsValidation(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object, {
      whitelist: true,
    });

    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: this.buildErrors(errors),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    this.handleDebugLogging(object);

    return object;
  }

  /**
   * Builds a flattened object representing validation errors.
   *
   * @param {ValidationError[]} errors - An array of ValidationError objects.
   * @param {string} [prefix=''] - A string prefix used for nested validation properties.
   * @return {Record<string, string>} - An object where keys are property paths and values are error messages.
   */
  private buildErrors(errors: ValidationError[], prefix = '') {
    let result: Record<string, string> = {};

    for (const err of errors) {
      if (err.children.length > 0) {
        const nestedErrors = this.buildErrors(
          err.children,
          `${prefix}${err.property}.`,
        );

        result = { ...result, ...nestedErrors };
        continue;
      }

      Object.entries(err.constraints).forEach((constraint) => {
        result[`${prefix}${err.property}`] = `${constraint[1]}`;
      });
    }

    return result;
  }

  /**
   * Handles debug logging by outputting the payload to the console when in a development environment.
   *
   * @param {Record<string, unknown>} payload - The data to be logged.
   * @return {void}
   */
  private handleDebugLogging(payload: Record<string, unknown>) {
    if (process.env.NODE_ENV === Environments.Development) {
      // eslint-disable-next-line no-console
      console.log(payload);
    }
  }

  /**
   * Checks if the given metatype requires validation.
   *
   * @param {unknown} metatype - The data type to be checked.
   * @return {boolean} Returns true if the metatype requires validation, false otherwise.
   */
  private needsValidation(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
