-- Create content table for course materials
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'article', 'quiz', 'assignment')),
  title TEXT NOT NULL,
  link TEXT,
  metadata JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Content policies: instructors can manage content for their courses
CREATE POLICY "Instructors can view content for their courses"
  ON public.content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = content.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can insert content for their courses"
  ON public.content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = content.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update content for their courses"
  ON public.content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = content.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete content for their courses"
  ON public.content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = content.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Students can view content for courses they're enrolled in
CREATE POLICY "Students can view content for enrolled courses"
  ON public.content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = content.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- Update courses table policies for instructors
CREATE POLICY "Instructors can view their own courses"
  ON public.courses FOR SELECT
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their own courses"
  ON public.courses FOR UPDATE
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can delete their own courses"
  ON public.courses FOR DELETE
  USING (instructor_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_content_course_id ON public.content(course_id);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);