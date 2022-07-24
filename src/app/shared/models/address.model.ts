import { AddressCountry } from "../enums/address-country.enum";

export class Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: AddressCountry;
}