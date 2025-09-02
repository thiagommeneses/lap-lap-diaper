export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      baby_info: {
        Row: {
          birth_date: string | null
          birth_place: string | null
          created_at: string
          gender: string | null
          id: string
          is_born: boolean | null
          name: string
          parent1_name: string | null
          parent2_name: string | null
          updated_at: string
          url_slug: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          is_born?: boolean | null
          name: string
          parent1_name?: string | null
          parent2_name?: string | null
          updated_at?: string
          url_slug?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          is_born?: boolean | null
          name?: string
          parent1_name?: string | null
          parent2_name?: string | null
          updated_at?: string
          url_slug?: string | null
          user_id?: string
        }
        Relationships: []
      }
      diaper_age_groups: {
        Row: {
          age_range: string
          color_theme: string | null
          created_at: string | null
          estimated_quantity: number
          icon_name: string | null
          id: string
          name: string
          price_per_unit: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_range: string
          color_theme?: string | null
          created_at?: string | null
          estimated_quantity?: number
          icon_name?: string | null
          id?: string
          name: string
          price_per_unit?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_range?: string
          color_theme?: string | null
          created_at?: string | null
          estimated_quantity?: number
          icon_name?: string | null
          id?: string
          name?: string
          price_per_unit?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      diaper_donations: {
        Row: {
          age_group_id: string | null
          created_at: string | null
          created_by: string | null
          donation_date: string | null
          donor_contact: string | null
          donor_name: string | null
          id: string
          notes: string | null
          quantity: number
        }
        Insert: {
          age_group_id?: string | null
          created_at?: string | null
          created_by?: string | null
          donation_date?: string | null
          donor_contact?: string | null
          donor_name?: string | null
          id?: string
          notes?: string | null
          quantity: number
        }
        Update: {
          age_group_id?: string | null
          created_at?: string | null
          created_by?: string | null
          donation_date?: string | null
          donor_contact?: string | null
          donor_name?: string | null
          id?: string
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "diaper_donations_age_group_id_fkey"
            columns: ["age_group_id"]
            isOneToOne: false
            referencedRelation: "diaper_age_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      diaper_purchases: {
        Row: {
          age_group_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          purchase_date: string | null
          quantity: number
          store_name: string | null
          total_cost: number | null
          unit_price: number | null
        }
        Insert: {
          age_group_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          purchase_date?: string | null
          quantity: number
          store_name?: string | null
          total_cost?: number | null
          unit_price?: number | null
        }
        Update: {
          age_group_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          store_name?: string | null
          total_cost?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diaper_purchases_age_group_id_fkey"
            columns: ["age_group_id"]
            isOneToOne: false
            referencedRelation: "diaper_age_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      diaper_stock: {
        Row: {
          age_group_id: string | null
          current_quantity: number
          id: string
          last_updated_at: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          age_group_id?: string | null
          current_quantity?: number
          id?: string
          last_updated_at?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          age_group_id?: string | null
          current_quantity?: number
          id?: string
          last_updated_at?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diaper_stock_age_group_id_fkey"
            columns: ["age_group_id"]
            isOneToOne: false
            referencedRelation: "diaper_age_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      diaper_usage: {
        Row: {
          age_group_id: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          quantity: number
          usage_date: string | null
          user_id: string
        }
        Insert: {
          age_group_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          quantity: number
          usage_date?: string | null
          user_id: string
        }
        Update: {
          age_group_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          usage_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      page_settings: {
        Row: {
          created_at: string
          id: string
          subtitle: string | null
          title: string | null
          updated_at: string
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      baby_profiles: {
        Row: {
          birth_date: string | null
          birth_place: string | null
          diaper_groups: Json | null
          gender: string | null
          is_born: boolean | null
          name: string | null
          parent1_name: string | null
          parent2_name: string | null
          subtitle: string | null
          title: string | null
          url_slug: string | null
          welcome_message: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_url_slug: {
        Args: { input_name: string }
        Returns: string
      }
      get_baby_profile_by_slug: {
        Args: { baby_slug: string }
        Returns: {
          birth_date: string
          birth_place: string
          diaper_groups: Json
          gender: string
          is_born: boolean
          name: string
          parent1_name: string
          parent2_name: string
          subtitle: string
          title: string
          url_slug: string
          welcome_message: string
        }[]
      }
      get_donation_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          age_group_id: string
          age_group_name: string
          last_donation_date: string
          total_donations: number
          total_quantity: number
        }[]
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
