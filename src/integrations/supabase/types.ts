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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      course_lessons: {
        Row: {
          created_at: string
          description: string
          duration: string
          id: string
          module_id: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration?: string
          id?: string
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string
        }
        Update: {
          created_at?: string
          description?: string
          duration?: string
          id?: string
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          created_at: string
          emoji: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_captures: {
        Row: {
          id: string
          link_id: string
          email: string
          captured_at: string
          source_block_id: string | null
        }
        Insert: {
          id?: string
          link_id: string
          email: string
          captured_at?: string
          source_block_id?: string | null
        }
        Update: {
          id?: string
          link_id?: string
          email?: string
          captured_at?: string
          source_block_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_captures_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          }
        ]
      }
      lesson_materials: {
        Row: {
          created_at: string
          id: string
          label: string
          lesson_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          lesson_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          lesson_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clicks: {
        Row: {
          button_id: string | null
          clicked_at: string
          country: string | null
          device: string | null
          id: string
          link_id: string
          referrer: string | null
        }
        Insert: {
          button_id?: string | null
          clicked_at?: string
          country?: string | null
          device?: string | null
          id?: string
          link_id: string
          referrer?: string | null
        }
        Update: {
          button_id?: string | null
          clicked_at?: string
          country?: string | null
          device?: string | null
          id?: string
          link_id?: string
          referrer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      link_views: {
        Row: {
          country: string | null
          device: string | null
          id: string
          link_id: string
          referrer: string | null
          viewed_at: string
        }
        Insert: {
          country?: string | null
          device?: string | null
          id?: string
          link_id: string
          referrer?: string | null
          viewed_at?: string
        }
        Update: {
          country?: string | null
          device?: string | null
          id?: string
          link_id?: string
          referrer?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_views_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          accent_color: string | null
          background_color: string | null
          badges: Json | null
          blocks: Json | null
          business_name: string
          buttons: Json | null
          created_at: string
          custom_domain: string | null
          entry_animation: string | null
          floating_emojis: Json | null
          font_family: string | null
          hero_image: string | null
          hero_image_height_px: number | null
          hero_object_fit: string | null
          hero_focal_point: Json | null
          hero_image_opacity: number | null
          hero_overlay_opacity: number | null
          hero_overlay_color: string | null
          hide_business_name: boolean | null
          hide_tagline: boolean | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          logo_size_px: number | null
          logo_shape: string | null
          logo_shadow: boolean | null
          pages: Json | null
          slug: string
          snow_effect: Json | null
          tagline: string | null
          text_color: string | null
          title_size: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          badges?: Json | null
          blocks?: Json | null
          business_name?: string
          buttons?: Json | null
          created_at?: string
          custom_domain?: string | null
          entry_animation?: string | null
          floating_emojis?: Json | null
          font_family?: string | null
          hero_image?: string | null
          hero_image_height_px?: number | null
          hero_object_fit?: string | null
          hero_focal_point?: Json | null
          hero_image_opacity?: number | null
          hero_overlay_opacity?: number | null
          hero_overlay_color?: string | null
          hide_business_name?: boolean | null
          hide_tagline?: boolean | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          logo_size_px?: number | null
          logo_shape?: string | null
          logo_shadow?: boolean | null
          pages?: Json | null
          slug: string
          snow_effect?: Json | null
          tagline?: string | null
          text_color?: string | null
          title_size?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          badges?: Json | null
          blocks?: Json | null
          business_name?: string
          buttons?: Json | null
          created_at?: string
          custom_domain?: string | null
          entry_animation?: string | null
          floating_emojis?: Json | null
          font_family?: string | null
          hero_image?: string | null
          hero_image_height_px?: number | null
          hero_object_fit?: string | null
          hero_focal_point?: Json | null
          hero_image_opacity?: number | null
          hero_overlay_opacity?: number | null
          hero_overlay_color?: string | null
          hide_business_name?: boolean | null
          hide_tagline?: boolean | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          logo_size_px?: number | null
          logo_shape?: string | null
          logo_shadow?: boolean | null
          pages?: Json | null
          slug?: string
          snow_effect?: Json | null
          tagline?: string | null
          text_color?: string | null
          title_size?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_contacts: {
        Row: {
          channel_type: string
          created_at: string
          description: string
          id: string
          sort_order: number
          title: string
          url: string
        }
        Insert: {
          channel_type: string
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title: string
          url: string
        }
        Update: {
          channel_type?: string
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title?: string
          url?: string
        }
        Relationships: []
      }
      support_faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_link_with_plan: {
        Args: { p_slug: string }
        Returns: Json
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          company: string
          created_at: string
          display_name: string
          email: string
          id: string
          plan: string
          user_id: string
        }[]
      }
      get_course_modules: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_links_with_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          accent_color: string
          background_color: string
          badges: Json
          blocks: Json
          business_name: string
          buttons: Json
          clicks_count: number
          created_at: string
          custom_domain: string
          entry_animation: string
          floating_emojis: Json
          font_family: string
          hero_image: string
          id: string
          is_active: boolean
          logo_url: string
          pages: Json
          slug: string
          snow_effect: Json
          tagline: string
          text_color: string
          title_size: number
          updated_at: string
          views_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_link_owner: { Args: { _link_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
