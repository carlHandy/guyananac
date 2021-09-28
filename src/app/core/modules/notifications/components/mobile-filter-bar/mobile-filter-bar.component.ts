import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NotificationsService } from '../../../../../shared/services/notifications.service';
import { Observable } from 'rxjs';
import { filter, map, startWith, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-mobile-filter-bar',
  templateUrl: './mobile-filter-bar.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilterBarComponent implements OnInit {
  auctionsIds$: Observable<number[]>;

  searchValue: FormControl = new FormControl('');
  last: number;
  constructor(public notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.auctionsIds$ = this.notificationsService.notifications$.pipe(
      filter((list) => list.length > 0),
      take(1),
      map((notifications) => {
        return [...new Set(notifications.map((n) => n.am_auction_id))];
      })
    );

    this.searchValue.valueChanges.pipe(startWith('')).subscribe((value) => {
      this.notificationsService.textSearch$.next(value);
    });
  }

  // selected auction Id for filtering
  auctionIdSelection(value: number) {
    this.notificationsService.auctionIdFilter$.next(value);
  }
}
