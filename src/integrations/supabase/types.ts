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
      activity_logs: {
        Row: {
          activity_id: string
          activity_time: string | null
          course_id: string | null
          event_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_id?: string
          activity_time?: string | null
          course_id?: string | null
          event_type: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_id?: string
          activity_time?: string | null
          course_id?: string | null
          event_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone_number: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone_number: string
          role: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone_number?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          category: string | null
          correct_answer: string | null
          course_id: string | null
          created_at: string | null
          id: string
          question_number: number
          question_text: string
          question_type: string
        }
        Insert: {
          assessment_id: string
          category?: string | null
          correct_answer?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          question_number: number
          question_text: string
          question_type: string
        }
        Update: {
          assessment_id?: string
          category?: string | null
          correct_answer?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          question_number?: number
          question_text?: string
          question_type?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_code: string
          certificate_id: string
          course_code: string | null
          course_id: string
          display_id: string | null
          expiry_date: string | null
          issue_date: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          certificate_code?: string
          certificate_id?: string
          course_code?: string | null
          course_id: string
          display_id?: string | null
          expiry_date?: string | null
          issue_date?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          certificate_code?: string
          certificate_id?: string
          course_code?: string | null
          course_id?: string
          display_id?: string | null
          expiry_date?: string | null
          issue_date?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          comment_text: string
          comment_time: string | null
          created_at: string | null
          discussion_id: string
          id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          comment_time?: string | null
          created_at?: string | null
          discussion_id: string
          id?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          comment_time?: string | null
          created_at?: string | null
          discussion_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["discussion_id"]
          },
        ]
      }
      content: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          link: string | null
          metadata: Json | null
          order_index: number | null
          title: string
          type: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          order_index?: number | null
          title: string
          type: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          order_index?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_prerequisites: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          prerequisite_course_id: string | null
          prerequisite_text: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          prerequisite_course_id?: string | null
          prerequisite_text?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          prerequisite_course_id?: string | null
          prerequisite_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_prerequisites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_prerequisites_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          instructor_id: string | null
          status: string | null
          thumbnail: string | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          instructor_id?: string | null
          status?: string | null
          thumbnail?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          instructor_id?: string | null
          status?: string | null
          thumbnail?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          body: string
          course_id: string
          created_at: string | null
          created_by_user_id: string
          discussion_id: string
          discussion_type: string | null
          title: string
        }
        Insert: {
          body: string
          course_id: string
          created_at?: string | null
          created_by_user_id: string
          discussion_id?: string
          discussion_type?: string | null
          title: string
        }
        Update: {
          body?: string
          course_id?: string
          created_at?: string | null
          created_by_user_id?: string
          discussion_id?: string
          discussion_type?: string | null
          title?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string | null
          id: string
          progress: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_expertise: {
        Row: {
          created_at: string | null
          expertise: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expertise: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expertise?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      instructor_profiles: {
        Row: {
          bio: string | null
          certification: string | null
          created_at: string | null
          degree: string | null
          experience_years: number | null
          field_of_study: string | null
          graduation_year: number | null
          id: string
          institution: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          certification?: string | null
          created_at?: string | null
          degree?: string | null
          experience_years?: number | null
          field_of_study?: string | null
          graduation_year?: number | null
          id?: string
          institution?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          certification?: string | null
          created_at?: string | null
          degree?: string | null
          experience_years?: number | null
          field_of_study?: string | null
          graduation_year?: number | null
          id?: string
          institution?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_reports: {
        Row: {
          course_id: string
          created_at: string | null
          generated_at: string
          performance_report_id: string
          recommendations: string
          strengths: string
          student_id: string
          weakness: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          generated_at?: string
          performance_report_id: string
          recommendations: string
          strengths: string
          student_id: string
          weakness: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          generated_at?: string
          performance_report_id?: string
          recommendations?: string
          strengths?: string
          student_id?: string
          weakness?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: string | null
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          interests: string | null
          learning_goals: string | null
          name: string
          phone_number: string | null
          profile_summary: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          achievements?: string | null
          avatar?: string | null
          created_at?: string | null
          email: string
          id: string
          interests?: string | null
          learning_goals?: string | null
          name: string
          phone_number?: string | null
          profile_summary?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          achievements?: string | null
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          interests?: string | null
          learning_goals?: string | null
          name?: string
          phone_number?: string | null
          profile_summary?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          course_id: string
          last_accessed: string | null
          percentage_completed: number | null
          progress_id: string
          student_id: string
          time_spent_minutes: number | null
        }
        Insert: {
          course_id: string
          last_accessed?: string | null
          percentage_completed?: number | null
          progress_id?: string
          student_id: string
          time_spent_minutes?: number | null
        }
        Update: {
          course_id?: string
          last_accessed?: string | null
          percentage_completed?: number | null
          progress_id?: string
          student_id?: string
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string | null
          difficulty_level: string | null
          quiz_id: string
          title: string
          total_marks: number
        }
        Insert: {
          course_id: string
          created_at?: string | null
          difficulty_level?: string | null
          quiz_id?: string
          title: string
          total_marks?: number
        }
        Update: {
          course_id?: string
          created_at?: string | null
          difficulty_level?: string | null
          quiz_id?: string
          title?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings_reviews: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          id: string
          rating_score: number
          student_id: string
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          rating_score: number
          student_id: string
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          rating_score?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          access_level: string | null
          course_id: string
          resource_id: string
          resource_type: string
          storage_location: string
          title: string
        }
        Insert: {
          access_level?: string | null
          course_id: string
          resource_id?: string
          resource_type: string
          storage_location: string
          title: string
        }
        Update: {
          access_level?: string | null
          course_id?: string
          resource_id?: string
          resource_type?: string
          storage_location?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          attempt_time: string | null
          feedback_text: string | null
          obtained_score: number
          quiz_id: string
          score_id: string
          student_id: string
        }
        Insert: {
          attempt_time?: string | null
          feedback_text?: string | null
          obtained_score: number
          quiz_id: string
          score_id?: string
          student_id: string
        }
        Update: {
          attempt_time?: string | null
          feedback_text?: string | null
          obtained_score?: number
          quiz_id?: string
          score_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      student_assessments: {
        Row: {
          assessment_id: string
          assessment_title: string
          assessment_type: string
          course_id: string | null
          created_at: string | null
          due_date_time: string | null
          feedback: string | null
          id: string
          obtained_mark: number | null
          performance_level: string | null
          status: string | null
          student_id: string
          total_marks: number
        }
        Insert: {
          assessment_id: string
          assessment_title: string
          assessment_type: string
          course_id?: string | null
          created_at?: string | null
          due_date_time?: string | null
          feedback?: string | null
          id?: string
          obtained_mark?: number | null
          performance_level?: string | null
          status?: string | null
          student_id: string
          total_marks?: number
        }
        Update: {
          assessment_id?: string
          assessment_title?: string
          assessment_type?: string
          course_id?: string | null
          created_at?: string | null
          due_date_time?: string | null
          feedback?: string | null
          id?: string
          obtained_mark?: number | null
          performance_level?: string | null
          status?: string | null
          student_id?: string
          total_marks?: number
        }
        Relationships: []
      }
      student_courses: {
        Row: {
          category: string
          course_id: string
          created_at: string | null
          difficulty_level: string | null
          instructor_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          category: string
          course_id: string
          created_at?: string | null
          difficulty_level?: string | null
          instructor_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          category?: string
          course_id?: string
          created_at?: string | null
          difficulty_level?: string | null
          instructor_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          course_id: string
          created_at: string
          enrollment_id: string
          learning_status: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrollment_id: string
          learning_status?: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrollment_id?: string
          learning_status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_course"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "student_courses"
            referencedColumns: ["course_id"]
          },
        ]
      }
      student_prerequisites: {
        Row: {
          course_id: string
          course_title: string
          created_at: string | null
          id: string
          prerequisite_course_id: string
        }
        Insert: {
          course_id: string
          course_title: string
          created_at?: string | null
          id?: string
          prerequisite_course_id: string
        }
        Update: {
          course_id?: string
          course_title?: string
          created_at?: string | null
          id?: string
          prerequisite_course_id?: string
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          answer: string
          assessment_id: string
          created_at: string | null
          id: string
          status: string
          student_id: string
        }
        Insert: {
          answer: string
          assessment_id: string
          created_at?: string | null
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          answer?: string
          assessment_id?: string
          created_at?: string | null
          id?: string
          status?: string
          student_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role:
        | "admin"
        | "student"
        | "instructor"
        | "advisor"
        | "data_scientist"
        | "dev_team"
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
      app_role: [
        "admin",
        "student",
        "instructor",
        "advisor",
        "data_scientist",
        "dev_team",
      ],
    },
  },
} as const
