import { Pipe, PipeTransform } from '@angular/core';
import { AuctionTypeEnum } from '@shared/enums/auction-type.enum';

@Pipe({
  name: 'auctionType',
})
export class AuctionTypePipe implements PipeTransform {
  transform(type: AuctionTypeEnum, ...args: unknown[]): string {
    if (!type) {
      return '';
    }

    switch (type) {
      case AuctionTypeEnum.MaxsoldManaged:
        return 'MAXSOLD MANAGED';
      case AuctionTypeEnum.SellerManaged:
        return 'SELLER MANAGED';
      case AuctionTypeEnum.Hybrid:
        return 'HYBRID MANAGED';
      default:
        return '';
    }
  }
}
