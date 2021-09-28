import { NotificationTypeEnum } from '@shared/enums/notification-type.enum';

export interface Notification {
  notificationId: number;
  notificationDate: Date; // created Date
  notificationType: NotificationTypeEnum;
  notificationSubject: string;
  notificationBody: string;
}
