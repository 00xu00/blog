export interface Blog {
  id: number;
  title: string;
  subtitle?: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author_id: number;
  is_published: boolean;
  likes_count: number;
  favorites_count: number;
  views_count: number;
  is_liked?: boolean;
  is_favorited?: boolean;
  author?: {
    id: number;
    username: string;
    avatar?: string;
  };
}
