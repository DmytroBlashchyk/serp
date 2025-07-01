import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { UserStatusEnum } from 'modules/users/enums/user-status.enum';

export class UserStatusResponse extends WithEnumDto(UserStatusEnum) {}
