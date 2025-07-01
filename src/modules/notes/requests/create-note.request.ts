import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyStringDecorator } from 'modules/common/decorators/is-not-empty-string.decorator';

export class CreateNoteRequest {
  @ApiProperty()
  @IsNotEmptyStringDecorator({
    invalidErrorMessage: 'Text is invalid.',
    requiredErrorMessage: 'Text is required.',
  })
  text: string;
}
