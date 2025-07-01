import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyStringDecorator } from 'modules/common/decorators/is-not-empty-string.decorator';

export class CreateFolderRequest {
  @ApiProperty()
  @IsNotEmptyStringDecorator({
    invalidErrorMessage: 'Name is invalid.',
    requiredErrorMessage: 'Name is required.',
  })
  name: string;
}
