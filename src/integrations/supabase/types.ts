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
      applications: {
        Row: {
          admin_remarks: string | null
          applied_at: string | null
          id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          admin_remarks?: string | null
          applied_at?: string | null
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          admin_remarks?: string | null
          applied_at?: string | null
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          applications_count: number | null
          company_name: string
          created_at: string | null
          created_by: string | null
          deadline: string
          description: string
          eligibility_criteria: string | null
          eligible_courses: Database["public"]["Enums"]["course"][] | null
          eligible_departments:
            | Database["public"]["Enums"]["department"][]
            | null
          eligible_years: number[] | null
          extra_info: string | null
          id: string
          is_active: boolean | null
          job_title: string
          job_type: Database["public"]["Enums"]["job_type"]
          location: string
          openings: number
          required_skills: string[] | null
          responsibilities: string | null
          salary_range: string | null
          selection_process: string | null
          updated_at: string | null
        }
        Insert: {
          applications_count?: number | null
          company_name: string
          created_at?: string | null
          created_by?: string | null
          deadline: string
          description: string
          eligibility_criteria?: string | null
          eligible_courses?: Database["public"]["Enums"]["course"][] | null
          eligible_departments?:
            | Database["public"]["Enums"]["department"][]
            | null
          eligible_years?: number[] | null
          extra_info?: string | null
          id?: string
          is_active?: boolean | null
          job_title: string
          job_type?: Database["public"]["Enums"]["job_type"]
          location: string
          openings?: number
          required_skills?: string[] | null
          responsibilities?: string | null
          salary_range?: string | null
          selection_process?: string | null
          updated_at?: string | null
        }
        Update: {
          applications_count?: number | null
          company_name?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string
          description?: string
          eligibility_criteria?: string | null
          eligible_courses?: Database["public"]["Enums"]["course"][] | null
          eligible_departments?:
            | Database["public"]["Enums"]["department"][]
            | null
          eligible_years?: number[] | null
          extra_info?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string
          openings?: number
          required_skills?: string[] | null
          responsibilities?: string | null
          salary_range?: string | null
          selection_process?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          backlogs: number | null
          certifications: string[] | null
          cgpa: number | null
          course: Database["public"]["Enums"]["course"] | null
          created_at: string | null
          date_of_birth: string | null
          department: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          passing_year: number | null
          phone: string | null
          portfolio_url: string | null
          profile_completed: boolean | null
          resume_url: string | null
          roll_number: string | null
          skills: string[] | null
          tenth_percentage: number | null
          twelfth_percentage: number | null
          updated_at: string | null
          user_id: string
          year_of_study: number | null
        }
        Insert: {
          address?: string | null
          backlogs?: number | null
          certifications?: string[] | null
          cgpa?: number | null
          course?: Database["public"]["Enums"]["course"] | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          passing_year?: number | null
          phone?: string | null
          portfolio_url?: string | null
          profile_completed?: boolean | null
          resume_url?: string | null
          roll_number?: string | null
          skills?: string[] | null
          tenth_percentage?: number | null
          twelfth_percentage?: number | null
          updated_at?: string | null
          user_id: string
          year_of_study?: number | null
        }
        Update: {
          address?: string | null
          backlogs?: number | null
          certifications?: string[] | null
          cgpa?: number | null
          course?: Database["public"]["Enums"]["course"] | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: Database["public"]["Enums"]["department"] | null
          email?: string
          full_name?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          passing_year?: number | null
          phone?: string | null
          portfolio_url?: string | null
          profile_completed?: boolean | null
          resume_url?: string | null
          roll_number?: string | null
          skills?: string[] | null
          tenth_percentage?: number | null
          twelfth_percentage?: number | null
          updated_at?: string | null
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_eligible_for_job: {
        Args: {
          _eligible_courses: Database["public"]["Enums"]["course"][]
          _eligible_departments: Database["public"]["Enums"]["department"][]
          _eligible_years: number[]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      application_status:
        | "applied"
        | "shortlisted"
        | "rejected"
        | "selected"
        | "next_round"
      course: "BCA" | "MCA" | "BTECH"
      department: "AIIT" | "AIT" | "ASFT" | "AIBAS" | "OTHER"
      job_type: "internship" | "part_time" | "full_time"
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
      app_role: ["admin", "student"],
      application_status: [
        "applied",
        "shortlisted",
        "rejected",
        "selected",
        "next_round",
      ],
      course: ["BCA", "MCA", "BTECH"],
      department: ["AIIT", "AIT", "ASFT", "AIBAS", "OTHER"],
      job_type: ["internship", "part_time", "full_time"],
    },
  },
} as const
