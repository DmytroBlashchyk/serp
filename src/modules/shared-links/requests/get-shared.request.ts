import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortProjectsByLinkEnum } from 'modules/shared-links/enums/sort-projects-by-link.enum';

export class GetSharedRequest extends WithSorting(
  SortProjectsByLinkEnum,
  PaginatedSearchRequest,
) {
  @ApiProperty({ enum: BooleanEnum, nullable: true, required: false })
  @IsEnum(BooleanEnum)
  @IsOptional()
  requirePassword: BooleanEnum;

  @ApiProperty({ nullable: true, required: false })
  @IsValidPassword()
  @IsOptional()
  password?: string;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  projectName: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  url: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  totalKeywords: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  improved: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  declined: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  noChange: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  dailyAverage: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  frequency: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  created: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, required: true, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  updated: BooleanEnum = BooleanEnum.TRUE;
}
