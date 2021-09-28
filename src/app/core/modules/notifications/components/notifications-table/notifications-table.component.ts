import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable, of, BehaviorSubject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AuctionNotification } from '../../../../../shared/models/auction-notification.interface';
import { NotificationsService } from '../../../../../shared/services/notifications.service';

// models

@Component({
  selector: 'app-notifications-table',
  templateUrl: './notifications-table.component.html',
  styleUrls: ['./notifications-table.component.scss'],
})
export class NotificationsTableComponent implements OnInit {
  notifications$: Observable<AuctionNotification[]>;
  totalUnread$: Observable<Number>;
  sortBy$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  ngOnInit() {}
  constructor(private notificationService: NotificationsService) {
    const notifications = this.notificationService.notifications$.pipe(
      filter((list) => list.length > 0),
      take(1)
    );

    // combile lastest values from filters and notifications
    this.notifications$ = combineLatest([
      notifications,
      this.notificationService.auctionIdFilter$,
      this.notificationService.textSearch$,
      this.sortBy$,
    ]).pipe(
      map(([notifications, auctionFilter, text, sort]) => {
        let filteredNotifications = notifications;

        if (auctionFilter > 0) {
          filteredNotifications = filteredNotifications.filter(
            (n) => n.am_auction_id === auctionFilter
          );
        }
        text = text.toLowerCase();
        if (text !== '') {
          filteredNotifications = filteredNotifications.filter((n) => {
            if (n.friendlyName.toLowerCase().indexOf(text) >= 0) {
              return true;
            }

            if (n.message.toLowerCase().indexOf(text) >= 0) {
              return true;
            }

            if (n.am_auction_id.toString().toLowerCase().indexOf(text) >= 0) {
              return true;
            }

            return false;
          });
        }

        if (sort != '') {
          if (sort === 'auction') {
            filteredNotifications.sort(this.sortAuction);
          } else if (sort === 'subject') {
            filteredNotifications.sort(this.sortSubject);
          } else if (sort === 'type') {
            filteredNotifications.sort(this.sortType);
          } else {
            filteredNotifications.sort(this.sortDate);
          }
        } else {
          filteredNotifications.sort(this.sortDate);
        }

        return filteredNotifications;
      })
    );

    this.totalUnread$ = this.notificationService.getNotificationsUnread();
  }

  setSorting(sort: string) {
    this.sortBy$.next(sort);
  }

  trackByIdentity(index: number, item: any) {
    return item.notificationId;
  }

  sortDate(a: AuctionNotification, b: AuctionNotification) {
    if (a.dateSent < b.dateSent) {
      return 1;
    }
    if (a.dateSent > b.dateSent) {
      return -1;
    }

    return 0;
  }

  sortAuction(a: AuctionNotification, b: AuctionNotification) {
    if (a.auctionId < b.auctionId) {
      return -1;
    }
    if (a.auctionId > b.auctionId) {
      return 1;
    }

    return 0;
  }
  sortSubject(a: AuctionNotification, b: AuctionNotification) {
    if (a.friendlyName < b.friendlyName) {
      return 1;
    }
    if (a.friendlyName > b.friendlyName) {
      return -1;
    }

    return 0;
  }

  sortType(a: AuctionNotification, b: AuctionNotification) {
    if (a.priority < b.priority) {
      return -1;
    }
    if (a.priority > b.priority) {
      return 1;
    }

    return 0;
  }
}
