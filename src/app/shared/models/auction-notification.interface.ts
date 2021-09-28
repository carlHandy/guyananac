import { NotificationTypeEnum } from '@shared/enums/notification-type.enum';

export interface AuctionNotification {
  notificationId: number;
  friendlyName: string;
  priority: NotificationTypeEnum;
  message: string;
  dateSent: any;
  read: boolean;
  // check
  auctionId?: string;
  am_auction_id?: number;
  mx_auction_id?: number;
}
