import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { SharedLinkTypeEnum } from 'modules/shared-links/enums/shared-link-type.enum';

export class SharedLinkTypeResponse extends WithEnumDto(SharedLinkTypeEnum) {}
