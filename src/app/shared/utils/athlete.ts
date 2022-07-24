import firebase from 'firebase/app';

import { Athlete } from '../models/athlete.model';
import { getCurrentTimeFixed } from './timeStamp';
import * as CryptoJS from 'crypto-js';

// creates a new athlete with the given basic information
export function createBaseAthlete(
  baseUser: firebase.User,
  firstName: string,
  lastName: string,
  isNationalAthlete: boolean,
): Athlete {
  const athlete = new Athlete();
  athlete.athleteId = String(CryptoJS.SHA256('a' + baseUser.email));
  athlete.firstName = firstName;
  athlete.lastName = lastName;
  athlete.createdDate = getCurrentTimeFixed();
  athlete.modifiedDate = getCurrentTimeFixed();
  athlete.email = baseUser.email;
  athlete.profilePicture = '';
  athlete.isNationalAthlete = isNationalAthlete;


  return athlete;
}
