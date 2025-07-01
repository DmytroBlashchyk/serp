import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';

export class UpdateUserInvitationRequest {
  @ApiProperty({ enum: RoleEnum, nullable: true, required: false })
  @IsEnum(RoleEnum)
  @IsOptional()
  roleName?: RoleEnum;

  @ApiProperty()
  @IsId({ each: true, nullable: true })
  folderIds: IdType[];

  @ApiProperty()
  @IsId({ each: true, nullable: true })
  projectIds: IdType[];
}
