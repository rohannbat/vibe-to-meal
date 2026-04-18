export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          email?: string;
        };
        Relationships: [];
      };
      meal_history: {
        Row: {
          id: string;
          user_id: string;
          meal_name: string;
          description: string | null;
          ingredients: string[] | null;
          instructions: string | null;
          vibe: string;
          emoji: string | null;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_name: string;
          description?: string | null;
          ingredients?: string[] | null;
          instructions?: string | null;
          vibe: string;
          emoji?: string | null;
          saved_at?: string;
        };
        Update: {
          meal_name?: string;
          description?: string | null;
          ingredients?: string[] | null;
          instructions?: string | null;
          vibe?: string;
          emoji?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
