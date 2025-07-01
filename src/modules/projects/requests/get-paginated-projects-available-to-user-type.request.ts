import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortProjectsEnum } from 'modules/projects/enums/sort-projects.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { IdType } from 'modules/common/types/id-type.type';
import { IsEnum, IsOptional } from 'class-validator';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';

export class GetPaginatedProjectsAvailableToUserTypeRequest extends WithSorting(
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
}
