-- Create progress tracking table (separate from enrollments)
CREATE TABLE IF NOT EXISTS public.progress (
  progress_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  percentage_completed numeric DEFAULT 0 CHECK (percentage_completed >= 0 AND percentage_completed <= 100),
  time_spent_minutes integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  quiz_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  total_marks integer NOT NULL DEFAULT 100,
  difficulty_level text,
  created_at timestamptz DEFAULT now()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS public.scores (
  score_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id uuid REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE NOT NULL,
  obtained_score numeric NOT NULL,
  attempt_time timestamptz DEFAULT now(),
  feedback_text text
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  certificate_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  issue_date timestamptz DEFAULT now(),
  certificate_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex')
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
  discussion_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
  resource_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  resource_type text NOT NULL,
  title text NOT NULL,
  storage_location text NOT NULL,
  access_level text DEFAULT 'student'
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  activity_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  activity_time timestamptz DEFAULT now(),
  metadata jsonb
);

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS learning_goals text,
  ADD COLUMN IF NOT EXISTS interests text,
  ADD COLUMN IF NOT EXISTS achievements text,
  ADD COLUMN IF NOT EXISTS profile_summary text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Enable RLS on all new tables
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progress
CREATE POLICY "Students can view their own progress"
  ON public.progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own progress"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress"
  ON public.progress FOR UPDATE
  USING (auth.uid() = student_id);

-- RLS Policies for quizzes (students can view quizzes for enrolled courses)
CREATE POLICY "Students can view quizzes for enrolled courses"
  ON public.quizzes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = quizzes.course_id
    AND enrollments.user_id = auth.uid()
  ));

CREATE POLICY "Instructors can manage their course quizzes"
  ON public.quizzes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = quizzes.course_id
    AND courses.instructor_id = auth.uid()
  ));

-- RLS Policies for scores
CREATE POLICY "Students can view their own scores"
  ON public.scores FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own scores"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- RLS Policies for certificates
CREATE POLICY "Students can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = student_id);

-- RLS Policies for discussions
CREATE POLICY "Students can view discussions for enrolled courses"
  ON public.discussions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = discussions.course_id
    AND enrollments.user_id = auth.uid()
  ));

CREATE POLICY "Students can create discussions"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Students can update their own discussions"
  ON public.discussions FOR UPDATE
  USING (auth.uid() = created_by_user_id);

CREATE POLICY "Students can delete their own discussions"
  ON public.discussions FOR DELETE
  USING (auth.uid() = created_by_user_id);

-- RLS Policies for resources
CREATE POLICY "Students can view resources for enrolled courses"
  ON public.resources FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = resources.course_id
    AND enrollments.user_id = auth.uid()
  ));

CREATE POLICY "Instructors can manage their course resources"
  ON public.resources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = resources.course_id
    AND courses.instructor_id = auth.uid()
  ));

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_student ON public.progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON public.progress(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_scores_student ON public.scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_quiz ON public.scores(quiz_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_discussions_course ON public.discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_course ON public.resources(course_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_time ON public.activity_logs(activity_time);