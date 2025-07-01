import { UserPayload } from 'modules/common/types/user-payload.type';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { IdType } from 'modules/common/types/id-type.type';

export interface ChangeAccountBrandingType {
  user: UserPayload;
  companyName: string;
  companyUrl: string;
  tagline?: string;
  companyLogo?: Express.Multer.File;
  twitterLink?: string;
  facebookLink?: string;
  linkedinLink: string;
  emailReports?: BooleanEnum;
  sharedLinks?: BooleanEnum;
  validatedBySerpnest?: BooleanEnum;
  accountId: IdType;
}
