import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NotificationTypeEnum } from '@shared/enums/notification-type.enum';
import { AuctionNotification } from '@shared/models/auction-notification.interface';

@Component({
  selector: 'app-action-notification-expansion-panel',
  templateUrl: './action-notification-expansion-panel.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionNotificationExpansionPanelComponent {
  @Input() notification: AuctionNotification;
  types = NotificationTypeEnum;
  constructor() {}
}
