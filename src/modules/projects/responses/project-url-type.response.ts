import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { ProjectUrlTypesEnum } from 'modules/projects/enums/project-url-types.enum';

export class ProjectUrlTypeResponse extends WithEnumDto(ProjectUrlTypesEnum) {}
