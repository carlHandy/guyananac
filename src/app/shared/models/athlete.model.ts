import { Address } from './address.model';
import { Contact } from './contact.model';
import { Sport } from './sport.model';

export class Athlete {
    athleteId: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    address: Address;
    contact: Contact;
    profilePicture: string;
    sport: Sport;
    createdDate: Date | any;
    modifiedDate: Date | any;
    emailVerified: boolean;
    isNationalAthlete: boolean;
}