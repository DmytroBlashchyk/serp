import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortProjectsEnum } from 'modules/projects/enums/sort-projects.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';

export class GetAllProjectAvailableToUserRequest extends WithSorting(
  SortProjectsEnum,
  PaginatedSearchRequest,
) {
  @ApiProperty({ nullable: true, required: false })
  @IsId({ each: true, nullable: true })
  tagIds?: IdType[];

  @ApiProperty({ enum: CheckFrequencyEnum, nullable: true, required: false })
  @IsEnum(CheckFrequencyEnum)
  @IsOptional()
  frequencyName?: CheckFrequencyEnum;

  @ApiProperty({
    enum: BooleanEnum,
    nullable: true,
    required: false,
    default: BooleanEnum.FALSE,
  })
  @IsEnum(BooleanEnum)
  @IsOptional()
  dailyAverage: BooleanEnum = BooleanEnum.FALSE;
}
