import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { NotificationTypeEnum } from '@shared/enums/notification-type.enum';
import { AuctionNotification } from '@shared/models/auction-notification.interface';
import { NotificationsService } from '../../../../../shared/services/notifications.service';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItemComponent implements OnInit {
  @Input() notification: AuctionNotification;
  types = NotificationTypeEnum;
  constructor(private notificationService: NotificationsService) {}

  ngOnInit(): void {}

  // updates locally the read value of the notification and optimistically updates
  // the notification state
  onOpen() {
    if (!this.notification.read) {
      this.notification.read = true;
      this.notificationService.markAsRead(
        this.notification.auctionId,
        this.notification.notificationId,
        this.notification
      );
    }
  }
}
