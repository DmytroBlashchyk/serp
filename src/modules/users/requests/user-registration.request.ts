import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';
import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IsValidEmail } from 'modules/common/decorators/is-valid-email.decorator';

export class UserRegistrationRequest {
  @ApiProperty()
  @IsValidEmail()
  email: string;

  @ApiProperty()
  @IsValidPassword()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsId()
  tariffPlan: IdType;

  @ApiProperty()
  @IsId({ nullable: true })
  timezoneId?: IdType;

  @ApiProperty()
  @IsId({ nullable: true })
  countryId?: IdType;
}
