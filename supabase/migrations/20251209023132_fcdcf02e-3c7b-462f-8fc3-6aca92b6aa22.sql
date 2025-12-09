-- Add difficulty_level and status columns to courses table if not exists
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS difficulty_level text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create course_prerequisites table
CREATE TABLE IF NOT EXISTS public.course_prerequisites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  prerequisite_course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  prerequisite_text text,
  created_at timestamptz DEFAULT now()
);

-- Create ratings_reviews table
CREATE TABLE IF NOT EXISTS public.ratings_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating_score integer NOT NULL CHECK (rating_score >= 1 AND rating_score <= 5),
  content text,
  created_at timestamptz DEFAULT now()
);

-- Create instructor_profiles table for professional info
CREATE TABLE IF NOT EXISTS public.instructor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  degree text,
  field_of_study text,
  institution text,
  graduation_year integer,
  certification text,
  experience_years integer,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create instructor_expertise table
CREATE TABLE IF NOT EXISTS public.instructor_expertise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  expertise text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create comments table for discussions
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES public.discussions(discussion_id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment_text text NOT NULL,
  comment_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add discussion_type to discussions table
ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS discussion_type text DEFAULT 'general';

-- Enable RLS on new tables
ALTER TABLE public.course_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_prerequisites
CREATE POLICY "Anyone can view prerequisites" ON public.course_prerequisites FOR SELECT USING (true);
CREATE POLICY "Instructors can manage prerequisites for their courses" ON public.course_prerequisites FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_prerequisites.course_id AND courses.instructor_id = auth.uid())
);

-- RLS policies for ratings_reviews
CREATE POLICY "Anyone can view ratings" ON public.ratings_reviews FOR SELECT USING (true);
CREATE POLICY "Students can add ratings" ON public.ratings_reviews FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own ratings" ON public.ratings_reviews FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Students can delete own ratings" ON public.ratings_reviews FOR DELETE USING (auth.uid() = student_id);

-- RLS policies for instructor_profiles
CREATE POLICY "Anyone can view instructor profiles" ON public.instructor_profiles FOR SELECT USING (true);
CREATE POLICY "Instructors can manage own profile" ON public.instructor_profiles FOR ALL USING (auth.uid() = user_id);

-- RLS policies for instructor_expertise
CREATE POLICY "Anyone can view expertise" ON public.instructor_expertise FOR SELECT USING (true);
CREATE POLICY "Instructors can manage own expertise" ON public.instructor_expertise FOR ALL USING (auth.uid() = user_id);

-- RLS policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can add comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Add phone_number to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;