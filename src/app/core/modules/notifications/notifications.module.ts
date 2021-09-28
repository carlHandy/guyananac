import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { NotificationsTableComponent } from './components/notifications-table/notifications-table.component';
import { NotificationFilterBarComponent } from './components/notification-filter-bar/notification-filter-bar.component';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MobileFilterBarComponent } from './components/mobile-filter-bar/mobile-filter-bar.component';

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationsTableComponent,
    NotificationFilterBarComponent,
    NotificationItemComponent,
    MobileFilterBarComponent,
  ],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class NotificationsModule {}
