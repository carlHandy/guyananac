import { AddressCountryEnum } from '@shared/enums/address-country.enum';
import { Partner } from './partner.model';

export class Team {
  teamId: string;
  teamNumber: number;
  teamName: string;
  teamCountry: AddressCountryEnum;
  isPartner: boolean;
  teamMemberCount: number;
  partnerProfile?: Partner;

  teamAdmins: string[];
  teamViewers: string[];

  createdDate: any;
  modifiedDate: any;
}
