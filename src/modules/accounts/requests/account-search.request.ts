import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SearchRequest } from 'modules/accounts/requests/search.request';
import { IsEnum } from 'class-validator';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { ApiProperty } from '@nestjs/swagger';
import { SearchTypeEnum } from 'modules/accounts/enums/search-type.enum';

export class AccountSearchRequest extends WithSorting(
  SearchTypeEnum,
  SearchRequest,
) {
  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  projects: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  folders: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  keywords: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  tags: BooleanEnum = BooleanEnum.TRUE;
}
