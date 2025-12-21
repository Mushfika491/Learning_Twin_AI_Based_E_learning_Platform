-- Allow instructors to view enrollments for their courses
CREATE POLICY "Instructors can view enrollments for their courses"
ON public.enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.instructor_id = auth.uid()
  )
);

-- Allow instructors to view activity logs for their courses
CREATE POLICY "Instructors can view activity logs for their courses"
ON public.activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = activity_logs.course_id
    AND courses.instructor_id = auth.uid()
  )
);

-- Allow instructors to view student assessments for their courses
CREATE POLICY "Instructors can view assessments for their courses"
ON public.student_assessments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id::text = student_assessments.course_id
    AND courses.instructor_id = auth.uid()
  )
);