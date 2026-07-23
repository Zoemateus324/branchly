export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string;
          actor_email: string;
          created_at: string;
          id: string;
          payload: Json | null;
        };
        Insert: {
          action: string;
          actor_email: string;
          created_at?: string;
          id?: string;
          payload?: Json | null;
        };
        Update: {
          action?: string;
          actor_email?: string;
          created_at?: string;
          id?: string;
          payload?: Json | null;
        };
        Relationships: [];
      };
      ai_usage: {
        Row: {
          created_at: string;
          feature: string;
          id: string;
          model: string | null;
          tokens_estimate: number;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          feature: string;
          id?: string;
          model?: string | null;
          tokens_estimate?: number;
          user_email?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          feature?: string;
          id?: string;
          model?: string | null;
          tokens_estimate?: number;
          user_email?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      app_config: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      competitors: {
        Row: {
          created_at: string;
          id: string;
          location_id: string | null;
          name: string;
          owner_id: string;
          rating: number | null;
          review_count: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          location_id?: string | null;
          name: string;
          owner_id: string;
          rating?: number | null;
          review_count?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          location_id?: string | null;
          name?: string;
          owner_id?: string;
          rating?: number | null;
          review_count?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "competitors_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      insights: {
        Row: {
          body: string | null;
          category: string | null;
          created_at: string;
          id: string;
          owner_id: string;
          severity: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          owner_id: string;
          severity?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          owner_id?: string;
          severity?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          address: string | null;
          category: string | null;
          city: string | null;
          created_at: string;
          google_url: string | null;
          id: string;
          last_scraped_at: string | null;
          name: string;
          owner_id: string;
          rating: number | null;
          review_count: number | null;
          score: number | null;
          score_breakdown: Json | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          category?: string | null;
          city?: string | null;
          created_at?: string;
          google_url?: string | null;
          id?: string;
          last_scraped_at?: string | null;
          name: string;
          owner_id: string;
          rating?: number | null;
          review_count?: number | null;
          score?: number | null;
          score_breakdown?: Json | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          category?: string | null;
          city?: string | null;
          created_at?: string;
          google_url?: string | null;
          id?: string;
          last_scraped_at?: string | null;
          name?: string;
          owner_id?: string;
          rating?: number | null;
          review_count?: number | null;
          score?: number | null;
          score_breakdown?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          id: string;
          invited_at: string;
          member_email: string;
          member_user_id: string | null;
          owner_id: string;
          role: Database["public"]["Enums"]["team_role"];
          status: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          id?: string;
          invited_at?: string;
          member_email: string;
          member_user_id?: string | null;
          owner_id: string;
          role: Database["public"]["Enums"]["team_role"];
          status?: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          id?: string;
          invited_at?: string;
          member_email?: string;
          member_user_id?: string | null;
          owner_id?: string;
          role?: Database["public"]["Enums"]["team_role"];
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plan_overrides: {
        Row: {
          created_at: string;
          plan: string;
          reason: string | null;
          set_by: string;
          updated_at: string;
          user_email: string;
        };
        Insert: {
          created_at?: string;
          plan: string;
          reason?: string | null;
          set_by: string;
          updated_at?: string;
          user_email: string;
        };
        Update: {
          created_at?: string;
          plan?: string;
          reason?: string | null;
          set_by?: string;
          updated_at?: string;
          user_email?: string;
        };
        Relationships: [];
      };
      // NOTE: hand-written to match supabase/migrations/20260723120000_meta_connections.sql —
      // this file is normally auto-generated via `supabase gen types`. Regenerate for real
      // once that migration has been applied to the live database.
      meta_connections: {
        Row: {
          connected_at: string;
          created_at: string;
          id: string;
          instagram_business_account_id: string | null;
          instagram_username: string | null;
          last_synced_at: string | null;
          location_id: string | null;
          owner_id: string;
          page_access_token: string;
          page_id: string;
          page_name: string | null;
          updated_at: string;
        };
        Insert: {
          connected_at?: string;
          created_at?: string;
          id?: string;
          instagram_business_account_id?: string | null;
          instagram_username?: string | null;
          last_synced_at?: string | null;
          location_id?: string | null;
          owner_id: string;
          page_access_token: string;
          page_id: string;
          page_name?: string | null;
          updated_at?: string;
        };
        Update: {
          connected_at?: string;
          created_at?: string;
          id?: string;
          instagram_business_account_id?: string | null;
          instagram_username?: string | null;
          last_synced_at?: string | null;
          location_id?: string | null;
          owner_id?: string;
          page_access_token?: string;
          page_id?: string;
          page_name?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meta_connections_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          file_url: string | null;
          id: string;
          name: string;
          owner_id: string;
          period: string | null;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          file_url?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          period?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          file_url?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          period?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          author: string | null;
          comment: string | null;
          created_at: string;
          id: string;
          location_id: string | null;
          owner_id: string;
          posted_at: string | null;
          rating: number | null;
          reply: string | null;
          sentiment: string | null;
          source: string | null;
        };
        Insert: {
          author?: string | null;
          comment?: string | null;
          created_at?: string;
          id?: string;
          location_id?: string | null;
          owner_id: string;
          posted_at?: string | null;
          rating?: number | null;
          reply?: string | null;
          sentiment?: string | null;
          source?: string | null;
        };
        Update: {
          author?: string | null;
          comment?: string | null;
          created_at?: string;
          id?: string;
          location_id?: string | null;
          owner_id?: string;
          posted_at?: string | null;
          rating?: number | null;
          reply?: string | null;
          sentiment?: string | null;
          source?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      score_lookups: {
        Row: {
          breakdown: Json | null;
          category: string | null;
          city: string;
          created_at: string;
          id: string;
          name: string;
          rating: number | null;
          review_count: number | null;
          score: number | null;
          source_url: string | null;
          user_id: string | null;
        };
        Insert: {
          breakdown?: Json | null;
          category?: string | null;
          city: string;
          created_at?: string;
          id?: string;
          name: string;
          rating?: number | null;
          review_count?: number | null;
          score?: number | null;
          source_url?: string | null;
          user_id?: string | null;
        };
        Update: {
          breakdown?: Json | null;
          category?: string | null;
          city?: string;
          created_at?: string;
          id?: string;
          name?: string;
          rating?: number | null;
          review_count?: number | null;
          score?: number | null;
          source_url?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      team_role: "admin" | "financial" | "member";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      team_role: ["admin", "financial", "member"],
    },
  },
} as const;
