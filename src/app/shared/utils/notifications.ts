import { NotificationGroup } from '../models/notification-group.interface';

// parse notifications group of auctions into array
export function getGroups(group: any) {
  if (!group) {
    return [];
  }
  const g: NotificationGroup[] = [];
  for (const key in group) {
    g.push({ ...group[key] });
  }
  return g;
}
