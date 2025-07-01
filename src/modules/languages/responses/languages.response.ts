import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { LanguageResponse } from 'modules/languages/responses/language.response';

export class LanguagesResponse extends WithArrayResponse(LanguageResponse) {}
