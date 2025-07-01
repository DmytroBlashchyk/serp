import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyStringDecorator } from 'modules/common/decorators/is-not-empty-string.decorator';

export class UpdateFolderRequest {
  @ApiProperty()
  @IsNotEmptyStringDecorator({
    invalidErrorMessage: 'Name is invalid.',
    requiredErrorMessage: 'Name is required.',
  })
  newName: string;
}
