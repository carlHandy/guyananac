import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '../../../../../shared/models/address.model';

@Pipe({
  name: 'auctionAddress',
})
export class AuctionAddressPipe implements PipeTransform {
  transform(address: Address | null, ...args: unknown[]): string {
    if (!address) {
      return '';
    }
    let addressStr = '';

    if (address.address) {
      addressStr += `${address.address}`;
    }

    if (address.cityTown) {
      addressStr += `, ${address.cityTown}`;
    }

    if (address.stateProvince) {
      addressStr += `, ${address.stateProvince}`;
    }

    if (address.postalZip) {
      addressStr += `, ${address.postalZip}`;
    }

    if (address.country) {
      addressStr += `, ${address.country}`;
    }

    addressStr += `.`;

    return addressStr;
  }
}
