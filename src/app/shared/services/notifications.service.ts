import { Injectable } from '@angular/core';
import { AuctionNotification } from '@shared/models/auction-notification.interface';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { filter, map, mergeMap, tap, switchMap } from 'rxjs/operators';
import { NotificationGroup } from '../models/notification-group.interface';
import { getGroups } from '@shared/utils/notifications';
import { getCurrentTimeFixed } from '@shared/utils/timeStamp';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  notifications$: BehaviorSubject<AuctionNotification[]> = new BehaviorSubject<
    AuctionNotification[]
  >([]);

  auctionIdFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  textSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  // get all notifications that has status unread for the notification list
  getNotificationsUnread() {
    return this.notifications$.pipe(
      map((notifications) => {
        return notifications.filter((n) => !n.read).length;
      })
    );
  }

  // mark notification as read
  markAsRead(
    auctionId: string,
    notificationId: number,
    notification: AuctionNotification
  ) {
    const seller = this.authService.baseSeller;

    let notificationUpdate = {};

    // full object is needed to update notification
    notificationUpdate[`notifications.N${notificationId}`] = {
      dateSent: notification.dateSent,
      friendlyName: notification.friendlyName,
      message: notification.message,
      notificationId: notification.notificationId,
      priority: notification.priority,
      read: true,
      modifiedDate: getCurrentTimeFixed(),
    };
    // update map insede seller obj
    return this.firestore
      .collection('sellers')
      .doc(seller.sellerId)
      .collection<NotificationGroup>('notifications')
      .doc(auctionId)
      .update(notificationUpdate);
  }

  // get all notification from a seller
  getNotifications() {
    this.authService.seller
      .pipe(
        filter((s) => s != null),
        switchMap((seller) => {
          // querying sub collection of notifications
          return this.firestore
            .collection('sellers')
            .doc(seller.sellerId)
            .collection<NotificationGroup>('notifications')
            .valueChanges()
            .pipe(
              // mapping all groups of notifications to more easy way of handly
              map((groups) => {
                // array result of parsing
                const parsedGroups = getGroups(groups);

                let notifications: AuctionNotification[] = [];
                // build notifications
                parsedGroups.forEach((g) => {
                  notifications = [
                    ...notifications,
                    ...this.buildNotificationListFromGroup(g),
                  ];
                });

                this.notifications$.next(notifications);
              })
            );
        })
      )
      .subscribe();
  }

  // builds notification array from notification group
  buildNotificationListFromGroup(
    group: NotificationGroup
  ): AuctionNotification[] {
    if (!group) {
      return [];
    }
    const notifications: AuctionNotification[] = [];
    for (const key in group.notifications) {
      // parsing map element to obj
      notifications.push({
        ...group.notifications[key],
        auctionId: group.auctionGuid,
        am_auction_id: group.am_auction_id,
        mx_auction_id: group.mx_auction_id,
      });
    }
    return notifications;
  }
}
