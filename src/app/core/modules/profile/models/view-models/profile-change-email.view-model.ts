import { AuthenticationTypeEnum } from '@shared/enums/authentication-type.enum';

// interface used for change email section at seler-auth-information
export interface ProfileChangeEmailViewModel {
  email: string;
  type: AuthenticationTypeEnum;
  guid: string;
}
