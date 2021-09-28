import { AuthenticationTypeEnum } from '@shared/enums/authentication-type.enum';

// return the correct authenticated method for the provider Id
export const getAuthMethod = (providerId: string): AuthenticationTypeEnum => {
  let type: AuthenticationTypeEnum;

  switch (providerId) {
    case 'password':
      type = AuthenticationTypeEnum.FireAuth;
      break;
    case 'firebase':
      type = AuthenticationTypeEnum.FireAuth;
      break;
    case 'google.com':
      type = AuthenticationTypeEnum.Google;
      break;
    case 'google':
      type = AuthenticationTypeEnum.Google;
      break;
    case 'facebook':
      type = AuthenticationTypeEnum.Facebook;
      break;
    case 'facebook.com':
      type = AuthenticationTypeEnum.Facebook;
      break;
    default:
      type = AuthenticationTypeEnum.Unknown;
      break;
  }

  return type;
};
