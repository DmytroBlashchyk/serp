import { SharedPayloadType } from 'modules/shared-links/types/shared-payload.type';

export interface SharedLinkWithoutPasswordType {
  link: string;
  shared?: SharedPayloadType;
}
