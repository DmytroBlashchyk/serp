import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';

export class GoogleDomainsResponse extends WithArrayResponse(
  GoogleDomainResponse,
) {}
