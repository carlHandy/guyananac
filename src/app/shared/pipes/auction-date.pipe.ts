import { Pipe, PipeTransform } from '@angular/core';
import { TimeZonesService } from '@shared/services/time-zones.service';
import { AuthService } from '@shared/services/auth.service';

@Pipe({
  name: 'auctionDate',
})
export class AuctionDatePipe implements PipeTransform {
  constructor(
    private timeZoneSrv: TimeZonesService,
    private authService: AuthService
  ) {}

  transform(value: number): string {
    if (!value) {
      return '';
    }
    const timezone = this.authService.baseSeller.timezone;
    const res = new Date(value * 1000).toLocaleString('en-US', {
      timeZone: timezone ?? this.timeZoneSrv.defaultTimeZoneValue,
    });

    return res;
  }
}
