import { AuthenticationTypeEnum } from '@shared/enums/authentication-type.enum';
import { AddressCountryEnum } from '@shared/enums/address-country.enum';
import { ContactMethodEnum } from '@shared/enums/contact-method.enum';
import { NotificationPreferences } from './notification-preferences';
import { Invitation } from './invitation.model';
import { Training } from './training.model';
import { Address } from './address.model';

export class Seller {
  sellerId: string;
  firstName: string;
  lastName: string;
  covidIndicator: boolean;
  email: string; // key - change
  country: AddressCountryEnum;
  authenticationType: AuthenticationTypeEnum;
  preferredContactMethod: ContactMethodEnum;
  profilePhotoURI: string;
  phone: string;
  timezone: string; // Should be Enum check enum prop
  notificationPref: NotificationPreferences;

  mailingAddress?: Address;

  teamIds: string[];

  auctionsToDate: number;
  lotsToDate: number;

  training: Map<string, Training>; // courseId is the Key

  unreadNotificationsCount: number; // Update this field when notifications are read.
  sellerNotifications: Map<number, Date> | any; // notification Id is the key, Date is when read. Not in map if unread.

  createdDate: Date | any;
  modifiedDate: Date | any;
  auctionList: string[];
  // added by manuel to the model
  invitations: Invitation[];
  auctionInvitations: any;
}
