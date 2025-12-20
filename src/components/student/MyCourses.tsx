import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentCourse {
  course_id: string;
  title: string;
  category: string;
  difficulty_level: string | null;
  status: string | null;
  instructor_id: string | null;
  created_at: string | null;
}

interface StudentPrerequisite {
  id: string;
  course_id: string;
  course_title: string;
  prerequisite_course_id: string;
}

interface StudentEnrollment {
  enrollment_id: string;
  course_id: string;
  title: string;
  learning_status: string;
  created_at: string;
}


export function MyCourses({ userId }: { userId: string }) {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [prerequisites, setPrerequisites] = useState<StudentPrerequisite[]>([]);
  const [prerequisitesLoading, setPrerequisitesLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [prereqSearchTerm, setPrereqSearchTerm] = useState("");
  const [enrollmentSearchTerm, setEnrollmentSearchTerm] = useState("");
  
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isDeleteEnrollmentDialogOpen, setIsDeleteEnrollmentDialogOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<StudentCourse | null>(null);
  const [viewingEnrollment, setViewingEnrollment] = useState<StudentEnrollment | null>(null);
  const [editingCourse, setEditingCourse] = useState<StudentCourse | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingEnrollmentId, setDeletingEnrollmentId] = useState<string | null>(null);
  const [viewingPrereq, setViewingPrereq] = useState<StudentPrerequisite | null>(null);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState<string>("");
  
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    category: "",
    difficulty_level: "Beginner",
    status: "active",
    instructor_id: "",
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    setPrerequisitesLoading(true);
    
    // First fetch all courses to get course_id -> title mapping
    const { data: coursesData } = await supabase
      .from("student_courses")
      .select("course_id, title");
    
    if (!coursesData || coursesData.length === 0) {
      setPrerequisites([]);
      setPrerequisitesLoading(false);
      return;
    }
    
    // Create a map of course_id to title from student_courses
    const courseMap = new Map<string, string>();
    coursesData.forEach(c => {
      courseMap.set(c.course_id.trim(), c.title);
    });
    
    const courseIds = Array.from(courseMap.keys());
    
    const { data, error } = await supabase
      .from("student_prerequisites")
      .select("*")
      .order("course_id", { ascending: true });
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch prerequisites", variant: "destructive" });
    } else {
      // Filter to only show prerequisites for courses that exist in student_courses
      // And get the title from student_courses table instead
      const filteredPrereqs = (data || [])
        .filter(p => courseIds.includes(p.course_id.trim()))
        .map(p => ({
          ...p,
          // Override course_title with the title from student_courses table
          course_title: courseMap.get(p.course_id.trim()) || p.course_title
        }));
      setPrerequisites(filteredPrereqs);
    }
    setPrerequisitesLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_courses")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch courses", variant: "destructive" });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const fetchEnrollments = async () => {
    setEnrollmentsLoading(true);
    const { data, error } = await supabase
      .from("student_enrollments")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch enrollments", variant: "destructive" });
    } else {
      setEnrollments(data || []);
    }
    setEnrollmentsLoading(false);
  };

  const generateEnrollmentId = () => {
    const maxId = enrollments.reduce((max, e) => {
      const num = parseInt(e.enrollment_id.replace("EN-", "")) || 0;
      return num > max ? num : max;
    }, 0);
    return `EN-${maxId + 1}`;
  };

  const handleEnrollInCourse = async () => {
    if (!selectedCourseForEnrollment) {
      toast({ title: "Error", description: "Please select a course to enroll", variant: "destructive" });
      return;
    }

    const selectedCourse = courses.find(c => c.course_id === selectedCourseForEnrollment);
    if (!selectedCourse) {
      toast({ title: "Error", description: "Course not found", variant: "destructive" });
      return;
    }

    // Check if already enrolled
    const alreadyEnrolled = enrollments.some(e => e.course_id === selectedCourseForEnrollment);
    if (alreadyEnrolled) {
      toast({ title: "Error", description: "You are already enrolled in this course", variant: "destructive" });
      return;
    }

    const newEnrollmentId = generateEnrollmentId();
    const { error } = await supabase
      .from("student_enrollments")
      .insert({
        enrollment_id: newEnrollmentId,
        course_id: selectedCourse.course_id,
        title: selectedCourse.title,
        learning_status: "Not Started",
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Successfully enrolled in course!" });
      setIsEnrollDialogOpen(false);
      setSelectedCourseForEnrollment("");
      fetchEnrollments();
    }
  };

  const handleDeleteEnrollment = async () => {
    if (!deletingEnrollmentId) return;

    // Use trim to handle potential whitespace in the enrollment_id
    const trimmedId = deletingEnrollmentId.trim();
    
    const { error } = await supabase
      .from("student_enrollments")
      .delete()
      .eq("enrollment_id", trimmedId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Enrollment deleted successfully!" });
      setIsDeleteEnrollmentDialogOpen(false);
      setDeletingEnrollmentId(null);
      fetchEnrollments();
    }
  };

  const handleAddCourse = async () => {
    if (!formData.course_id || !formData.title || !formData.category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("student_courses")
      .insert({
        course_id: formData.course_id,
        title: formData.title,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        status: formData.status,
        instructor_id: formData.instructor_id || null,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Course added successfully!" });
      setIsAddCourseDialogOpen(false);
      resetForm();
      fetchCourses();
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;

    const { error } = await supabase
      .from("student_courses")
      .update({
        title: formData.title,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        status: formData.status,
        instructor_id: formData.instructor_id || null,
      })
      .eq("course_id", editingCourse.course_id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Course updated successfully!" });
      setIsEditCourseDialogOpen(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return;

    const { error } = await supabase
      .from("student_courses")
      .delete()
      .eq("course_id", deletingCourseId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Course deleted successfully!" });
      setIsDeleteDialogOpen(false);
      setDeletingCourseId(null);
      fetchCourses();
    }
  };

  const openEditDialog = (course: StudentCourse) => {
    setEditingCourse(course);
    setFormData({
      course_id: course.course_id,
      title: course.title,
      category: course.category,
      difficulty_level: course.difficulty_level || "Beginner",
      status: course.status || "active",
      instructor_id: course.instructor_id || "",
    });
    setIsEditCourseDialogOpen(true);
  };

  const openDeleteDialog = (courseId: string) => {
    setDeletingCourseId(courseId);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      course_id: "",
      title: "",
      category: "",
      difficulty_level: "Beginner",
      status: "active",
      instructor_id: "",
    });
  };

  const filteredCourses = courses.filter(c =>
    c.course_id.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  const filteredPrerequisites = prerequisites.filter(p =>
    p.course_id.toLowerCase().includes(prereqSearchTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e =>
    e.enrollment_id.toLowerCase().includes(enrollmentSearchTerm.toLowerCase()) ||
    e.course_id.toLowerCase().includes(enrollmentSearchTerm.toLowerCase())
  );

  const getAvailableCoursesForEnrollment = () => {
    // Trim whitespace from enrollment course_ids for accurate comparison
    const enrolledCourseIds = enrollments.map(e => e.course_id.trim());
    return courses.filter(c => !enrolledCourseIds.includes(c.course_id.trim()) && c.status === "active");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>

        {/* Courses Table */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Courses</CardTitle>
                <CardDescription>All available courses</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Course ID..."
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {loading ? (
                <p className="text-center text-muted-foreground py-4">Loading courses...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Instructor ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.course_id}>
                        <TableCell>
                          <Badge variant="outline">{course.course_id}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.difficulty_level || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.status === "active" ? "default" : "secondary"}>
                            {course.status || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.instructor_id || "N/A"}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setViewingCourse(course)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Course Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <p><strong>Course ID:</strong> {course.course_id}</p>
                                <p><strong>Title:</strong> {course.title}</p>
                                <p><strong>Category:</strong> {course.category}</p>
                                <p><strong>Difficulty:</strong> {course.difficulty_level || "N/A"}</p>
                                <p><strong>Status:</strong> {course.status || "N/A"}</p>
                                <p><strong>Instructor ID:</strong> {course.instructor_id || "N/A"}</p>
                                <p><strong>Created At:</strong> {course.created_at || "N/A"}</p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCourses.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                          No courses found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Course Dialog */}
          <Dialog open={isEditCourseDialogOpen} onOpenChange={setIsEditCourseDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Course</DialogTitle>
                <DialogDescription>Update course details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Course ID</Label>
                  <Input value={formData.course_id} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={formData.difficulty_level} onValueChange={(v) => setFormData({ ...formData, difficulty_level: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Instructor ID</Label>
                  <Input
                    value={formData.instructor_id}
                    onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditCourseDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleEditCourse}>Update Course</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Course</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this course? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteCourse}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Prerequisites Table */}
        <TabsContent value="prerequisites">
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
              <CardDescription>View course prerequisites (only showing courses available in the Courses table)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Course ID..."
                  value={prereqSearchTerm}
                  onChange={(e) => setPrereqSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {prerequisitesLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading prerequisites...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Prerequisite Course ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrerequisites.map(prereq => (
                      <TableRow key={prereq.id}>
                        <TableCell>
                          <Badge variant="outline">{prereq.course_id.trim()}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{prereq.course_title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{prereq.prerequisite_course_id.trim()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setViewingPrereq(prereq)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Prerequisite Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Course ID</p>
                                  <p className="font-medium">{prereq.course_id.trim()}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Course Title</p>
                                  <p className="font-medium">{prereq.course_title}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Prerequisite Course ID</p>
                                  <p className="font-medium">{prereq.prerequisite_course_id.trim()}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPrerequisites.length === 0 && !prerequisitesLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          No prerequisites found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollments Table */}
        <TabsContent value="enrollments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Enrollments</CardTitle>
                <CardDescription>Your course enrollments</CardDescription>
              </div>
              <Button onClick={() => setIsEnrollDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Enroll in Course
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Enrollment ID or Course ID..."
                  value={enrollmentSearchTerm}
                  onChange={(e) => setEnrollmentSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {enrollmentsLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading enrollments...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enrollment ID</TableHead>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Learning Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.enrollment_id}>
                        <TableCell>
                          <Badge variant="outline">{enrollment.enrollment_id}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{enrollment.course_id}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{enrollment.title}</TableCell>
                        <TableCell>
                          <Badge variant={
                            enrollment.learning_status === "Completed" ? "default" :
                            enrollment.learning_status === "In Progress" ? "secondary" :
                            "outline"
                          }>
                            {enrollment.learning_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{enrollment.created_at}</TableCell>
                        <TableCell className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setViewingEnrollment(enrollment)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enrollment Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <p><strong>Enrollment ID:</strong> {enrollment.enrollment_id}</p>
                                <p><strong>Course ID:</strong> {enrollment.course_id}</p>
                                <p><strong>Title:</strong> {enrollment.title}</p>
                                <p><strong>Learning Status:</strong> {enrollment.learning_status}</p>
                                <p><strong>Created At:</strong> {enrollment.created_at}</p>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setDeletingEnrollmentId(enrollment.enrollment_id);
                              setIsDeleteEnrollmentDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEnrollments.length === 0 && !enrollmentsLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                          No enrollments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Enroll in Course Dialog */}
          <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enroll in a Course</DialogTitle>
                <DialogDescription>Select a course to enroll in</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  <Select value={selectedCourseForEnrollment} onValueChange={setSelectedCourseForEnrollment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCoursesForEnrollment().map((course) => (
                        <SelectItem key={course.course_id} value={course.course_id}>
                          {course.course_id} - {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getAvailableCoursesForEnrollment().length === 0 && (
                    <p className="text-sm text-muted-foreground">No courses available for enrollment</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleEnrollInCourse} disabled={!selectedCourseForEnrollment}>
                    Enroll
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Enrollment Confirmation Dialog */}
          <Dialog open={isDeleteEnrollmentDialogOpen} onOpenChange={setIsDeleteEnrollmentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Enrollment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this enrollment? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteEnrollmentDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteEnrollment}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}