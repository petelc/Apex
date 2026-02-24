export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  entityId?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}
