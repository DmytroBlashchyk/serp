import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { RoleEnum } from 'modules/auth/enums/role.enum';

export class RoleResponse extends WithEnumDto(RoleEnum) {}
