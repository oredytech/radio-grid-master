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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      animateur_programs: {
        Row: {
          animateur_id: string
          created_at: string | null
          firebase_program_id: string | null
          id: string
          program_id: string
        }
        Insert: {
          animateur_id: string
          created_at?: string | null
          firebase_program_id?: string | null
          id?: string
          program_id: string
        }
        Update: {
          animateur_id?: string
          created_at?: string | null
          firebase_program_id?: string | null
          id?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "animateur_programs_animateur_id_fkey"
            columns: ["animateur_id"]
            isOneToOne: false
            referencedRelation: "animateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animateur_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      animateurs: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string
          firebase_user_id: string | null
          id: string
          nom: string
          photo_url: string | null
          prenom: string
          radio_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email: string
          firebase_user_id?: string | null
          id?: string
          nom: string
          photo_url?: string | null
          prenom: string
          radio_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string
          firebase_user_id?: string | null
          id?: string
          nom?: string
          photo_url?: string | null
          prenom?: string
          radio_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animateurs_firebase_user_id_fkey"
            columns: ["firebase_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animateurs_radio_id_fkey"
            columns: ["radio_id"]
            isOneToOne: false
            referencedRelation: "radios"
            referencedColumns: ["id"]
          },
        ]
      }
      conducteur_elements: {
        Row: {
          artiste: string | null
          conducteur_id: string
          created_at: string | null
          duree: string | null
          heure: string | null
          id: string
          notes: string | null
          ordre: number
          titre: string
          type: string
          updated_at: string | null
        }
        Insert: {
          artiste?: string | null
          conducteur_id: string
          created_at?: string | null
          duree?: string | null
          heure?: string | null
          id?: string
          notes?: string | null
          ordre: number
          titre: string
          type: string
          updated_at?: string | null
        }
        Update: {
          artiste?: string | null
          conducteur_id?: string
          created_at?: string | null
          duree?: string | null
          heure?: string | null
          id?: string
          notes?: string | null
          ordre?: number
          titre?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conducteur_elements_conducteur_id_fkey"
            columns: ["conducteur_id"]
            isOneToOne: false
            referencedRelation: "conducteurs"
            referencedColumns: ["id"]
          },
        ]
      }
      conducteurs: {
        Row: {
          commentaires: string | null
          created_at: string | null
          date: string
          firebase_program_id: string
          firebase_user_id: string
          id: string
          program_id: string | null
          status: Database["public"]["Enums"]["conducteur_status"] | null
          updated_at: string | null
        }
        Insert: {
          commentaires?: string | null
          created_at?: string | null
          date: string
          firebase_program_id: string
          firebase_user_id: string
          id?: string
          program_id?: string | null
          status?: Database["public"]["Enums"]["conducteur_status"] | null
          updated_at?: string | null
        }
        Update: {
          commentaires?: string | null
          created_at?: string | null
          date?: string
          firebase_program_id?: string
          firebase_user_id?: string
          id?: string
          program_id?: string | null
          status?: Database["public"]["Enums"]["conducteur_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conducteurs_firebase_user_id_fkey"
            columns: ["firebase_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conducteurs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted: boolean | null
          created_at: string | null
          email: string
          expires_at: string
          firebase_program_id: string | null
          id: string
          nom: string | null
          prenom: string | null
          program_id: string | null
          radio_id: string
          token: string
        }
        Insert: {
          accepted?: boolean | null
          created_at?: string | null
          email: string
          expires_at: string
          firebase_program_id?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          program_id?: string | null
          radio_id: string
          token: string
        }
        Update: {
          accepted?: boolean | null
          created_at?: string | null
          email?: string
          expires_at?: string
          firebase_program_id?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          program_id?: string | null
          radio_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_radio_id_fkey"
            columns: ["radio_id"]
            isOneToOne: false
            referencedRelation: "radios"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          firebase_user_id: string
          id: string
          link: string | null
          message: string
          read: boolean | null
          type: string
        }
        Insert: {
          created_at?: string | null
          firebase_user_id: string
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          type: string
        }
        Update: {
          created_at?: string | null
          firebase_user_id?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_firebase_user_id_fkey"
            columns: ["firebase_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          radio_name: string | null
          radio_slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          radio_name?: string | null
          radio_slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          radio_name?: string | null
          radio_slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          animateur_id: string | null
          created_at: string | null
          day_of_week: number | null
          description: string | null
          end_time: string | null
          firebase_id: string | null
          id: string
          radio_id: string
          slug: string
          start_time: string | null
          title: string
          type: Database["public"]["Enums"]["program_type"] | null
          updated_at: string | null
        }
        Insert: {
          animateur_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          description?: string | null
          end_time?: string | null
          firebase_id?: string | null
          id?: string
          radio_id: string
          slug: string
          start_time?: string | null
          title: string
          type?: Database["public"]["Enums"]["program_type"] | null
          updated_at?: string | null
        }
        Update: {
          animateur_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          description?: string | null
          end_time?: string | null
          firebase_id?: string | null
          id?: string
          radio_id?: string
          slug?: string
          start_time?: string | null
          title?: string
          type?: Database["public"]["Enums"]["program_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_radio_id_fkey"
            columns: ["radio_id"]
            isOneToOne: false
            referencedRelation: "radios"
            referencedColumns: ["id"]
          },
        ]
      }
      radios: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "radios_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "directeur" | "animateur"
      conducteur_status: "draft" | "pending" | "approved" | "published"
      program_type: "music" | "talk" | "news" | "sport" | "culture" | "other"
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
      app_role: ["admin", "directeur", "animateur"],
      conducteur_status: ["draft", "pending", "approved", "published"],
      program_type: ["music", "talk", "news", "sport", "culture", "other"],
    },
  },
} as const
