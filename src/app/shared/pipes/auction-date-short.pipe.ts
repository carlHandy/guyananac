import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';
import { TimeZonesService } from '@shared/services/time-zones.service';

@Pipe({
  name: 'auctionDateShort',
})
export class AuctionDateShortPipe implements PipeTransform {
  constructor(
    private timeZoneSrv: TimeZonesService,
    private authService: AuthService
  ) {}

  transform(value: number): string {
    if (!value) {
      return '';
    }
    const timezone = this.authService.baseSeller.timezone;

    const res = new Date(value * 1000).toLocaleDateString('en-US', {
      timeZone: timezone ?? this.timeZoneSrv.defaultTimeZoneValue,
    });

    return res;
  }
}
