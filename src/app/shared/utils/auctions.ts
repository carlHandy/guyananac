import { AuctionNotification } from '../models/auction-notification.interface';

// extracts the notification from an auction and parses the map into array
export function getNotificationsFromAuction(notificationsObj: any) {
  if (!notificationsObj) {
    return [];
  }
  const notifications: AuctionNotification[] = [];
  for (const key in notificationsObj) {
    notifications.push({ ...notificationsObj[key] });
  }
  return notifications;
}
