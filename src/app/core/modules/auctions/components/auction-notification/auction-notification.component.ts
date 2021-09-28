import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NotificationTypeEnum } from '@shared/enums/notification-type.enum';
import { AuctionNotification } from '@shared/models/auction-notification.interface';

@Component({
  selector: 'app-auction-notification',
  templateUrl: './auction-notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionNotificationComponent {
  @Input() notification: AuctionNotification;
  types = NotificationTypeEnum;
  constructor() {}
}
