import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidFile } from 'modules/common/decorators/is-valid-file.decorator';
import { isValidMaxFileSize } from 'modules/common/decorators/is-valid-max-file-size.decorator';
import { IsOptional } from 'class-validator';
import { isValidHasMimeType } from 'modules/common/decorators/is-valid-has-mime-type.decorator';
const APP_MAX_IMAGE_FILE_SIZE = 10000000;
export function IsImageFile({
  nullable = false,
  each = false,
  validationOptions = {},
} = {}) {
  return applyDecorators(
    ApiProperty({ required: !nullable, format: 'binary', type: 'string' }),
    IsValidFile({ nullable, each }),
    isValidMaxFileSize({
      nullable,
      each,
      maxSizeBytes: Number(APP_MAX_IMAGE_FILE_SIZE),
    }),
    nullable ? IsOptional() : (): unknown => null,
    isValidHasMimeType({
      ...validationOptions,
      each,
      nullable,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/bmp'],
    }),
  );
}
