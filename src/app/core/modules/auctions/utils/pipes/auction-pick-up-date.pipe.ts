import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../../../../../shared/services/auth.service';
import { TimeZonesService } from '../../../../../shared/services/time-zones.service';

@Pipe({
  name: 'auctionPickUpDate',
})
export class AuctionPickUpDatePipe implements PipeTransform {
  constructor(
    private authService: AuthService,
    private timeZoneService: TimeZonesService
  ) {}
  transform(initialDate: any, secondDate: any): string {
    const timeZone = this.authService.baseSeller.timezone;

    const start = new Date(initialDate * 1000).toLocaleString('en-US', {
      timeZone: timeZone ?? this.timeZoneService.defaultTimeZoneValue,
    });
    const end = new Date(secondDate * 1000).toLocaleTimeString('en-US', {
      timeZone: timeZone ?? this.timeZoneService.defaultTimeZoneValue,
    });

    if (!initialDate || !secondDate) {
      return 'No dates available';
    }
    return `${start} - ${end}`;
  }
}
