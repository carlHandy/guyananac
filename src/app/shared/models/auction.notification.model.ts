export interface AuctionNotification {
  auctionId: number; // KEY
  notificationList: Map<number, Notification>; // number is NotificationId
}
