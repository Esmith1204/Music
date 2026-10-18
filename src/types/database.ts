// Mirrors supabase/ratings.sql and supabase/schema.sql. Once the project exists, regenerate this file with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      // supabase/ratings.sql — what the rating page writes to today.
      ratings: {
        Row: {
          id: string;
          user_id: string;
          album_title: string;
          album_artist: string | null;
          album_year: number | null;
          cover_url: string;
          rating: number;
          review: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          album_title: string;
          album_artist?: string | null;
          album_year?: number | null;
          cover_url: string;
          rating: number;
          review?: string;
          created_at?: string;
        };
        Update: {
          rating?: number;
          review?: string;
        };
        Relationships: [];
      };
      // The tables below are the planned schema in supabase/schema.sql (with auth).
      profiles: {
        Row: {
          id: string;
          handle: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          handle: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          handle?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          album_title: string;
          album_artist: string | null;
          album_year: number | null;
          cover_url: string;
          rating: number;
          review: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          album_title: string;
          album_artist?: string | null;
          album_year?: number | null;
          cover_url: string;
          rating: number;
          review?: string;
          created_at?: string;
        };
        Update: {
          rating?: number;
          review?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "friendships_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      profile_stats: {
        Row: {
          id: string;
          post_count: number;
          follower_count: number;
          following_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
