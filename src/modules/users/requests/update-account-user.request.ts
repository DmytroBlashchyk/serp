import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';

export class UpdateAccountUserRequest {
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
