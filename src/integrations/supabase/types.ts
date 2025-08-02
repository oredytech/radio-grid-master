export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      animateur_programs: {
        Row: {
          animateur_id: string
          can_edit: boolean
          created_at: string
          firebase_program_id: string
          id: string
        }
        Insert: {
          animateur_id: string
          can_edit?: boolean
          created_at?: string
          firebase_program_id: string
          id?: string
        }
        Update: {
          animateur_id?: string
          can_edit?: boolean
          created_at?: string
          firebase_program_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "animateur_programs_animateur_id_fkey"
            columns: ["animateur_id"]
            isOneToOne: false
            referencedRelation: "animateurs"
            referencedColumns: ["id"]
          },
        ]
      }
      animateurs: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          firebase_user_id: string
          id: string
          nom: string
          prenom: string
          slug: string
          status: Database["public"]["Enums"]["animateur_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          firebase_user_id: string
          id?: string
          nom: string
          prenom: string
          slug: string
          status?: Database["public"]["Enums"]["animateur_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          firebase_user_id?: string
          id?: string
          nom?: string
          prenom?: string
          slug?: string
          status?: Database["public"]["Enums"]["animateur_status"]
          updated_at?: string
        }
        Relationships: []
      }
      conducteur_elements: {
        Row: {
          conducteur_id: string
          created_at: string
          description: string | null
          duree_minutes: number | null
          heure_prevue: string | null
          id: string
          intervenant: string | null
          musique_artiste: string | null
          musique_titre: string | null
          notes_techniques: string | null
          ordre: number
          titre: string
          type: Database["public"]["Enums"]["element_type"]
          updated_at: string
        }
        Insert: {
          conducteur_id: string
          created_at?: string
          description?: string | null
          duree_minutes?: number | null
          heure_prevue?: string | null
          id?: string
          intervenant?: string | null
          musique_artiste?: string | null
          musique_titre?: string | null
          notes_techniques?: string | null
          ordre: number
          titre: string
          type: Database["public"]["Enums"]["element_type"]
          updated_at?: string
        }
        Update: {
          conducteur_id?: string
          created_at?: string
          description?: string | null
          duree_minutes?: number | null
          heure_prevue?: string | null
          id?: string
          intervenant?: string | null
          musique_artiste?: string | null
          musique_titre?: string | null
          notes_techniques?: string | null
          ordre?: number
          titre?: string
          type?: Database["public"]["Enums"]["element_type"]
          updated_at?: string
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
      conducteur_versions: {
        Row: {
          conducteur_id: string
          contenu: Json
          created_at: string
          id: string
          version: number
        }
        Insert: {
          conducteur_id: string
          contenu: Json
          created_at?: string
          id?: string
          version: number
        }
        Update: {
          conducteur_id?: string
          contenu?: Json
          created_at?: string
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "conducteur_versions_conducteur_id_fkey"
            columns: ["conducteur_id"]
            isOneToOne: false
            referencedRelation: "conducteurs"
            referencedColumns: ["id"]
          },
        ]
      }
      conducteurs: {
        Row: {
          commentaires_directeur: string | null
          created_at: string
          date_emission: string
          firebase_program_id: string
          firebase_user_id: string
          heure_debut: string
          heure_fin: string
          id: string
          status: Database["public"]["Enums"]["conducteur_status"]
          titre: string
          updated_at: string
          version: number
        }
        Insert: {
          commentaires_directeur?: string | null
          created_at?: string
          date_emission: string
          firebase_program_id: string
          firebase_user_id: string
          heure_debut: string
          heure_fin: string
          id?: string
          status?: Database["public"]["Enums"]["conducteur_status"]
          titre: string
          updated_at?: string
          version?: number
        }
        Update: {
          commentaires_directeur?: string | null
          created_at?: string
          date_emission?: string
          firebase_program_id?: string
          firebase_user_id?: string
          heure_debut?: string
          heure_fin?: string
          id?: string
          status?: Database["public"]["Enums"]["conducteur_status"]
          titre?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          directeur_firebase_id: string
          email: string
          expires_at: string
          firebase_program_id: string
          id: string
          radio_nom: string
          radio_slug: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          directeur_firebase_id: string
          email: string
          expires_at: string
          firebase_program_id: string
          id?: string
          radio_nom: string
          radio_slug: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          directeur_firebase_id?: string
          email?: string
          expires_at?: string
          firebase_program_id?: string
          id?: string
          radio_nom?: string
          radio_slug?: string
          token?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          conducteur_id: string | null
          created_at: string
          firebase_user_id: string
          id: string
          lu: boolean
          message: string
          titre: string
          type: string
        }
        Insert: {
          conducteur_id?: string | null
          created_at?: string
          firebase_user_id: string
          id?: string
          lu?: boolean
          message: string
          titre: string
          type: string
        }
        Update: {
          conducteur_id?: string | null
          created_at?: string
          firebase_user_id?: string
          id?: string
          lu?: boolean
          message?: string
          titre?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_conducteur_id_fkey"
            columns: ["conducteur_id"]
            isOneToOne: false
            referencedRelation: "conducteurs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      animateur_status: "invite" | "actif" | "inactif"
      conducteur_status: "brouillon" | "en_attente" | "valide" | "rejete"
      element_type:
        | "introduction"
        | "rubrique"
        | "intervenant"
        | "musique"
        | "pub"
        | "meteo"
        | "flash"
        | "chronique"
        | "conclusion"
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
      animateur_status: ["invite", "actif", "inactif"],
      conducteur_status: ["brouillon", "en_attente", "valide", "rejete"],
      element_type: [
        "introduction",
        "rubrique",
        "intervenant",
        "musique",
        "pub",
        "meteo",
        "flash",
        "chronique",
        "conclusion",
      ],
    },
  },
} as const
