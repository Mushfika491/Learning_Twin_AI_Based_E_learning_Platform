import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminCourseFormDialog } from "./AdminCourseFormDialog";
import { EnrollmentFormDialog } from "./EnrollmentFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

interface Course {
  course_id: string;
  title: string;
  category: string;
  difficulty_level: string | null;
  status: string | null;
  instructor_id: string | null;
}

interface Enrollment {
  enrollment_id: string;
  course_id: string;
  title: string;
  learning_status: string;
  created_at: string;
}

export function CoursesEnrollmentsTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseSearch, setCourseSearch] = useState("");
  const [enrollmentSearch, setEnrollmentSearch] = useState("");
  
  // Course dialog state
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  
  // Enrollment dialog state
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [deleteEnrollmentOpen, setDeleteEnrollmentOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        supabase.from("student_courses").select("*").order("course_id"),
        supabase.from("student_enrollments").select("*").order("enrollment_id"),
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (enrollmentsRes.error) throw enrollmentsRes.error;

      setCourses(coursesRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // Course CRUD operations
  const handleAddCourse = async (courseData: Omit<Course, "course_id">) => {
    try {
      const nextId = courses.length > 0 
        ? `CSE-${String(parseInt(courses[courses.length - 1]?.course_id?.split("-")[1] || "100") + 1).padStart(3, "0")}`
        : "CSE-101";
      
      const { error } = await supabase.from("student_courses").insert({
        course_id: nextId,
        ...courseData,
      });

      if (error) throw error;
      toast.success("Course added successfully");
      fetchData();
      setCourseDialogOpen(false);
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course");
    }
  };

  const handleEditCourse = async (courseData: Course) => {
    try {
      const { error } = await supabase
        .from("student_courses")
        .update({
          title: courseData.title,
          category: courseData.category,
          difficulty_level: courseData.difficulty_level,
          status: courseData.status,
          instructor_id: courseData.instructor_id,
        })
        .eq("course_id", courseData.course_id);

      if (error) throw error;
      toast.success("Course updated successfully");
      fetchData();
      setCourseDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      const { error } = await supabase
        .from("student_courses")
        .delete()
        .eq("course_id", courseToDelete.course_id);

      if (error) throw error;
      toast.success("Course deleted successfully");
      fetchData();
      setDeleteCourseOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  // Enrollment CRUD operations
  const handleAddEnrollment = async (enrollmentData: Omit<Enrollment, "enrollment_id">) => {
    try {
      const existingIds = enrollments
        .map(e => parseInt(e.enrollment_id?.replace("EN-", "") || "0"))
        .filter(n => !isNaN(n));
      const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      const nextId = `EN-${nextNum}`;
      
      const { error } = await supabase.from("student_enrollments").insert({
        enrollment_id: nextId,
        ...enrollmentData,
      });

      if (error) throw error;
      toast.success("Enrollment added successfully");
      fetchData();
      setEnrollmentDialogOpen(false);
    } catch (error) {
      console.error("Error adding enrollment:", error);
      toast.error("Failed to add enrollment");
    }
  };

  const handleEditEnrollment = async (enrollmentData: Enrollment) => {
    try {
      const { error } = await supabase
        .from("student_enrollments")
        .update({
          course_id: enrollmentData.course_id,
          title: enrollmentData.title,
          learning_status: enrollmentData.learning_status,
        })
        .eq("enrollment_id", enrollmentData.enrollment_id);

      if (error) throw error;
      toast.success("Enrollment updated successfully");
      fetchData();
      setEnrollmentDialogOpen(false);
      setEditingEnrollment(null);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      toast.error("Failed to update enrollment");
    }
  };

  const handleDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;
    try {
      const { error } = await supabase
        .from("student_enrollments")
        .delete()
        .eq("enrollment_id", enrollmentToDelete.enrollment_id);

      if (error) throw error;
      toast.success("Enrollment deleted successfully");
      fetchData();
      setDeleteEnrollmentOpen(false);
      setEnrollmentToDelete(null);
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      toast.error("Failed to delete enrollment");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.course_id?.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.category?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.title?.toLowerCase().includes(enrollmentSearch.toLowerCase()) ||
      enrollment.enrollment_id?.toLowerCase().includes(enrollmentSearch.toLowerCase()) ||
      enrollment.course_id?.toLowerCase().includes(enrollmentSearch.toLowerCase())
  );

  const getStatusBadgeClass = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "in progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "not started":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="courses" className="space-y-6">
      <TabsList>
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
      </TabsList>

      <TabsContent value="courses">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Courses</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => { setEditingCourse(null); setCourseDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course_ID</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Instructor ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.course_id}>
                      <TableCell className="font-medium">{course.course_id}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>{course.difficulty_level || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(course.status)}`}>
                          {course.status || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{course.instructor_id || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingCourse(course); setCourseDialogOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setCourseToDelete(course); setDeleteCourseOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="enrollments">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Enrollments</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search enrollments..."
                  value={enrollmentSearch}
                  onChange={(e) => setEnrollmentSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => { setEditingEnrollment(null); setEnrollmentDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Enrollment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enrollment_ID</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Course_ID</TableHead>
                  <TableHead>Learning Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.enrollment_id}>
                      <TableCell className="font-medium">{enrollment.enrollment_id}</TableCell>
                      <TableCell>{enrollment.title}</TableCell>
                      <TableCell>{enrollment.course_id}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(enrollment.learning_status)}`}>
                          {enrollment.learning_status}
                        </span>
                      </TableCell>
                      <TableCell>{enrollment.created_at}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingEnrollment(enrollment); setEnrollmentDialogOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEnrollmentToDelete(enrollment); setDeleteEnrollmentOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Course Dialog */}
      <AdminCourseFormDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        onSubmit={editingCourse ? handleEditCourse : handleAddCourse}
        initialData={editingCourse}
        title={editingCourse ? "Edit Course" : "Add New Course"}
      />

      {/* Enrollment Dialog */}
      <EnrollmentFormDialog
        open={enrollmentDialogOpen}
        onOpenChange={setEnrollmentDialogOpen}
        onSubmit={editingEnrollment ? handleEditEnrollment : handleAddEnrollment}
        initialData={editingEnrollment}
        title={editingEnrollment ? "Edit Enrollment" : "Add New Enrollment"}
        courses={courses}
      />

      {/* Delete Course Confirmation */}
      <DeleteConfirmDialog
        open={deleteCourseOpen}
        onOpenChange={setDeleteCourseOpen}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        description={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone.`}
      />

      {/* Delete Enrollment Confirmation */}
      <DeleteConfirmDialog
        open={deleteEnrollmentOpen}
        onOpenChange={setDeleteEnrollmentOpen}
        onConfirm={handleDeleteEnrollment}
        title="Delete Enrollment"
        description={`Are you sure you want to delete enrollment "${enrollmentToDelete?.enrollment_id}"? This action cannot be undone.`}
      />
    </Tabs>
  );
}
