import { Address } from './address.model';

export interface Partner {
  companyName: string;
  partnerType: string;
  shopPageURL: string;
  companyDesc: string;
  companyURL: string;
  mailingAddress: Address;
  logoURL: string;
  // check
  partnerSince?: Date;
}
