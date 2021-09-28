import { AuctionNotification } from './auction-notification.interface';

export interface NotificationGroup {
  am_auction_id: number;
  auctionGuid: string;
  mx_auction_id: number;
  notifications: Map<string, AuctionNotification>;
}
