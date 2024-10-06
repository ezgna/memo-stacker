export interface Entry {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  date: string;
  text: string;
  user_id: string | null;
  // synced: number;
}