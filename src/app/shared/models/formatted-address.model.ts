// Stores the Google Maps returned address

export interface FormattedAddress {
  autocompletedAddress: string;
  cityTown: string;
  country: string;
  stateProvince: string;
  postalZip: string;
  street: string;
  streetNumber: string;
  lat: any;
  lng: any;
}
