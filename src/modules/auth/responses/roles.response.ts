import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { RoleResponse } from 'modules/auth/responses/role.response';

export class RolesResponse extends WithArrayResponse(RoleResponse) {}
