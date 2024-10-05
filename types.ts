export interface Entry {
  id: number;
  created_at: string;
  date: string;
  text: string;
  user_id: string | null;
  // synced: number;
}