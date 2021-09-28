import { AddressCountryEnum } from '../enums/address-country.enum';

export interface Address {
  address: string;
  unitSuite: string;
  cityTown: string;
  stateProvince: string;
  postalZip: string;
  country: AddressCountryEnum;
}
