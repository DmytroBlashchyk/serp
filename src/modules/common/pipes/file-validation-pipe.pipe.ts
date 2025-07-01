import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const HAS_MIME_TYPE = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];

@Injectable()
export class FileValidationPipe implements PipeTransform {
  /**
   * Transforms the input value by validating its size and mimetype.
   *
   * @param {any} value - The input value to transform.
   * @param {ArgumentMetadata} metadata - Metadata about the argument.
   * @return {any} The transformed value if it meets the specified criteria.
   * @throws {BadRequestException} If the value size exceeds 3MB or if the value mimetype is not allowed.
   */
  transform(value: any, metadata: ArgumentMetadata) {
    const oneKb = 3000000;
    if (value === undefined) {
      return value;
    }
    if (value.size > oneKb) {
      throw new BadRequestException('Maximum file size is 3MB');
    }

    if (!HAS_MIME_TYPE.includes(value.mimetype)) {
      throw new BadRequestException(
        `File must be of one of the types ${HAS_MIME_TYPE.join(', ')}`,
      );
    }
    return value;
  }
}
