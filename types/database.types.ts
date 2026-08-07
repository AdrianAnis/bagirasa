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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      donation_matches: {
        Row: {
          allocated_servings: number
          created_at: string
          distance_km: number
          donation_id: string
          handed_over_at: string | null
          id: string
          match_score: number | null
          notified_at: string | null
          recipient_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
        }
        Insert: {
          allocated_servings: number
          created_at?: string
          distance_km: number
          donation_id: string
          handed_over_at?: string | null
          id?: string
          match_score?: number | null
          notified_at?: string | null
          recipient_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Update: {
          allocated_servings?: number
          created_at?: string
          distance_km?: number
          donation_id?: string
          handed_over_at?: string | null
          id?: string
          match_score?: number | null
          notified_at?: string | null
          recipient_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_matches_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "food_donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_matches_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string
          created_at: string
          id: string
          ktp_url: string
          lat: number
          lng: number
          name: string
          phone: string
          photo_url: string | null
          profile_id: string
          reputation_score: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          ktp_url: string
          lat: number
          lng: number
          name: string
          phone: string
          photo_url?: string | null
          profile_id: string
          reputation_score?: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          ktp_url?: string
          lat?: number
          lng?: number
          name?: string
          phone?: string
          photo_url?: string | null
          profile_id?: string
          reputation_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          comment: string | null
          created_at: string
          donor_id: string
          id: string
          match_id: string
          rating: number
          recipient_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          donor_id: string
          id?: string
          match_id: string
          rating: number
          recipient_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          donor_id?: string
          id?: string
          match_id?: string
          rating?: number
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "donation_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      food_donations: {
        Row: {
          created_at: string
          donor_id: string
          id: string
          notes: string | null
          selection_mode: string
          status: Database["public"]["Enums"]["donation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          id?: string
          notes?: string | null
          selection_mode?: string
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          id?: string
          notes?: string | null
          selection_mode?: string
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      food_items: {
        Row: {
          allergens: string[]
          created_at: string
          donation_id: string
          food_type: Database["public"]["Enums"]["food_type"]
          id: string
          ingredients: string
          is_halal: boolean
          name: string
          photo_url: string | null
          quantity: number
          servings: number
          shelf_life_hours: number
          unit: string
        }
        Insert: {
          allergens?: string[]
          created_at?: string
          donation_id: string
          food_type: Database["public"]["Enums"]["food_type"]
          id?: string
          ingredients: string
          is_halal?: boolean
          name: string
          photo_url?: string | null
          quantity: number
          servings: number
          shelf_life_hours: number
          unit?: string
        }
        Update: {
          allergens?: string[]
          created_at?: string
          donation_id?: string
          food_type?: Database["public"]["Enums"]["food_type"]
          id?: string
          ingredients?: string
          is_halal?: boolean
          name?: string
          photo_url?: string | null
          quantity?: number
          servings?: number
          shelf_life_hours?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_items_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "food_donations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          profile_id: string
          reference_id: string | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id: string
          reference_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id?: string
          reference_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      recipients: {
        Row: {
          address: string
          allergen_restrictions: string[]
          capacity: number
          created_at: string
          current_need: number
          halal_only: boolean
          id: string
          last_received_at: string | null
          lat: number
          legal_doc_url: string
          lng: number
          name: string
          phone: string
          photo_url: string | null
          profile_id: string
          type: Database["public"]["Enums"]["recipient_type"]
          updated_at: string
        }
        Insert: {
          address: string
          allergen_restrictions?: string[]
          capacity: number
          created_at?: string
          current_need?: number
          halal_only?: boolean
          id?: string
          last_received_at?: string | null
          lat: number
          legal_doc_url: string
          lng: number
          name: string
          phone: string
          photo_url?: string | null
          profile_id: string
          type: Database["public"]["Enums"]["recipient_type"]
          updated_at?: string
        }
        Update: {
          address?: string
          allergen_restrictions?: string[]
          capacity?: number
          created_at?: string
          current_need?: number
          halal_only?: boolean
          id?: string
          last_received_at?: string | null
          lat?: number
          legal_doc_url?: string
          lng?: number
          name?: string
          phone?: string
          photo_url?: string | null
          profile_id?: string
          type?: Database["public"]["Enums"]["recipient_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_logs: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          message: string
          provider_response: Json | null
          status: string
          target_phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          message: string
          provider_response?: Json | null
          status: string
          target_phone: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          message?: string
          provider_response?: Json | null
          status?: string
          target_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_logs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "donation_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_insights: {
        Row: {
          donor_id: string
          generated_at: string
          id: string
          impact: Json
          period_end: string
          period_start: string
          recommendations: Json
          summary: string
        }
        Insert: {
          donor_id: string
          generated_at?: string
          id?: string
          impact: Json
          period_end: string
          period_start: string
          recommendations: Json
          summary: string
        }
        Update: {
          donor_id?: string
          generated_at?: string
          id?: string
          impact?: Json
          period_end?: string
          period_start?: string
          recommendations?: Json
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_insights_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_donor_id: { Args: never; Returns: string }
      current_recipient_id: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_matched_recipient: {
        Args: { target_donation_id: string }
        Returns: boolean
      }
      owns_donation: { Args: { target_donation_id: string }; Returns: boolean }
      verified_recipients: {
        Args: never
        Returns: {
          allergen_restrictions: string[]
          capacity: number
          current_need: number
          halal_only: boolean
          id: string
          last_received_at: string
          lat: number
          lng: number
          name: string
        }[]
      }
    }
    Enums: {
      donation_status:
        | "draft"
        | "available"
        | "matched"
        | "completed"
        | "cancelled"
      food_type:
        | "makanan_berat"
        | "makanan_ringan"
        | "minuman"
        | "roti_kue"
        | "buah_sayur"
        | "lainnya"
      match_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "confirmed"
        | "completed"
      recipient_type: "panti_asuhan" | "rumah_lansia"
      user_role: "donor" | "recipient" | "admin"
      verification_status: "pending" | "verified" | "rejected"
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
      donation_status: [
        "draft",
        "available",
        "matched",
        "completed",
        "cancelled",
      ],
      food_type: [
        "makanan_berat",
        "makanan_ringan",
        "minuman",
        "roti_kue",
        "buah_sayur",
        "lainnya",
      ],
      match_status: [
        "pending",
        "accepted",
        "rejected",
        "confirmed",
        "completed",
      ],
      recipient_type: ["panti_asuhan", "rumah_lansia"],
      user_role: ["donor", "recipient", "admin"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
