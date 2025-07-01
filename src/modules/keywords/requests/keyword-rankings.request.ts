import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortKeywordRankingsEnum } from 'modules/keywords/enums/sort-keyword-rankings.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class KeywordRankingsRequest extends WithSorting(
  SortKeywordRankingsEnum,
  PaginatedSearchRequest,
) {
  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  top3: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  top10: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  top30: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  top100: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  improved: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  declined: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  lost: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  notRanked: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  noChange: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: DeviceTypesEnum, default: DeviceTypesEnum.Desktop })
  @IsEnum(DeviceTypesEnum)
  deviceType: DeviceTypesEnum = DeviceTypesEnum.Desktop;

  @ApiProperty({ isArray: true })
  @IsId({ each: true, nullable: true })
  tagIds?: IdType[];
}
