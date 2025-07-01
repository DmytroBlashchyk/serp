import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class UpdateUserRequest {
  @ApiProperty()
  @IsEnum(RoleEnum)
  roleName: RoleEnum;

  @ApiProperty({ required: false })
  @IsId({ nullable: true, each: true })
  folderIds?: IdType[];

  @ApiProperty({ required: false })
  @IsId({ nullable: true, each: true })
  projectIds?: IdType[];
}
