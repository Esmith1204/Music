// Mirrors supabase/migrations/*.sql. To regenerate from the live project instead:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type RatingMethod = "manual" | "comparison";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          handle: string;
          display_name: string;
          avatar_url: string | null;
          bio: string;
          created_at: string;
        };
        Insert: {
          id: string;
          handle: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
        };
        Update: {
          handle?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string;
        };
        Relationships: [];
      };
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
          method: RatingMethod;
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
          method?: RatingMethod;
          created_at?: string;
        };
        Update: {
          rating?: number;
          review?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ratings_user_id_fkey";
            columns: ["user_id"];
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
          rating_count: number;
          follower_count: number;
          following_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      handle_available: {
        Args: { candidate: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
