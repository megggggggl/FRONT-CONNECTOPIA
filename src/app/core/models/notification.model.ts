export interface Notification {
  id:  string;
  recipient_id: string;
  sender_id: string | null;
  entity_type: 'post' | 'service' | 'review' | 'report' | 'event' | 'favorite' | 'verification';
  entity_id: string | null;
  type: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}