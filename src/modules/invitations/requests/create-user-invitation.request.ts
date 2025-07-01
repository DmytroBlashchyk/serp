import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IsValidEmail } from 'modules/common/decorators/is-valid-email.decorator';

export class CreateUserInvitationRequest {
  @ApiProperty()
  @IsValidEmail()
  email: string;

  @ApiProperty({ enum: RoleEnum })
  @IsEnum(RoleEnum)
  roleName: RoleEnum;

  @ApiProperty()
  @IsId({ each: true, nullable: true })
  folderIds: IdType[];

  @ApiProperty()
  @IsId({ each: true, nullable: true })
  projectIds: IdType[];
}
