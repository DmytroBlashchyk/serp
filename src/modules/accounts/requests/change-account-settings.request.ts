import { IsOptional, IsString } from 'class-validator';
import { IdType } from 'modules/common/types/id-type.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';

export class ChangeAccountSettingsRequest {
  @ApiProperty({ required: true })
  @IsString()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  lastName: string;

  @ApiProperty({ required: true })
  @IsString()
  countryId: IdType;

  @ApiProperty({ required: true })
  @IsString()
  timezoneId: IdType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsValidPassword()
  newPassword?: string;
}
