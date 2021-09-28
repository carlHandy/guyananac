import firebase from 'firebase/app';

import { Seller } from '../models/seller.model';
import { AddressCountryEnum } from '../enums/address-country.enum';
import { getAuthMethod } from 'src/app/auth/utils/helpers';
import { ContactMethodEnum } from '@shared/enums/contact-method.enum';
import { getCurrentTimeFixed } from './timeStamp';

// creates a new seller with the given basic information
export function createBaseSeller(
  baseUser: firebase.User,
  firstName: string,
  lastName: string,
  country: AddressCountryEnum,
  timeZone: string
): Seller {
  const seller = new Seller();
  seller.sellerId = baseUser.uid;
  seller.firstName = firstName;
  seller.lastName = lastName;
  seller.country = country;
  seller.createdDate = getCurrentTimeFixed();
  seller.modifiedDate = getCurrentTimeFixed();
  seller.email = baseUser.email;
  seller.covidIndicator = false;
  seller.preferredContactMethod = ContactMethodEnum.Email;
  seller.timezone = timeZone;
  seller.profilePhotoURI = '';
  seller.authenticationType = getAuthMethod(
    baseUser.providerData[0].providerId
  );
  seller.notificationPref = {
    info: true,
    important: true,
  };
  seller.teamIds = [];
  seller.auctionList = [];

  return seller;
}
