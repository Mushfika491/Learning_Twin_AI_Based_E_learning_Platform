import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, Trash2, Plus, Pencil } from "lucide-react";
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

interface Prerequisite {
  id: string;
  course_id: string;
  prerequisite_text: string | null;
  prerequisite_course_id: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  status: string;
  progress: number | null;
  courses: {
    title: string;
    category: string;
  };
}

const mockPrerequisites: Prerequisite[] = [
  { id: "PRE-001", course_id: "CSE-102", prerequisite_text: "Basic Python knowledge", prerequisite_course_id: "CSE-101" },
  { id: "PRE-002", course_id: "CSE-103", prerequisite_text: "Data Science Fundamentals", prerequisite_course_id: "CSE-102" },
  { id: "PRE-003", course_id: "CSE-104", prerequisite_text: "Statistics knowledge", prerequisite_course_id: null },
  { id: "PRE-004", course_id: "CSE-105", prerequisite_text: "HTML/CSS basics", prerequisite_course_id: null },
  { id: "PRE-005", course_id: "CSE-106", prerequisite_text: "Basic computer skills", prerequisite_course_id: null },
];

const mockEnrollments: Enrollment[] = [
  { id: "EN-1", course_id: "CSE-101", enrolled_at: "2024-01-15T10:30:00Z", status: "in_progress", progress: 65, courses: { title: "Introduction to Python", category: "Programming" } },
  { id: "EN-2", course_id: "CSE-102", enrolled_at: "2024-02-20T14:15:00Z", status: "completed", progress: 100, courses: { title: "Data Science Fundamentals", category: "Data Science" } },
  { id: "EN-3", course_id: "CSE-103", enrolled_at: "2024-03-10T09:00:00Z", status: "in_progress", progress: 30, courses: { title: "Web Development Basics", category: "Web Development" } },
  { id: "EN-4", course_id: "CSE-104", enrolled_at: "2024-03-25T11:45:00Z", status: "not_started", progress: 0, courses: { title: "Machine Learning Intro", category: "AI/ML" } },
  { id: "EN-5", course_id: "CSE-105", enrolled_at: "2024-04-01T16:20:00Z", status: "in_progress", progress: 45, courses: { title: "Database Management", category: "Database" } },
];

// Helper function to format enrollment ID as "EN-1" format
const formatEnrollmentId = (id: string, index: number = 0): string => {
  if (id.includes("EN-")) return id;
  return `EN-${index + 1}`;
};

export function MyCourses({ userId }: { userId: string }) {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>(mockPrerequisites);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments);
  const [loading, setLoading] = useState(true);
  
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [prereqSearchTerm, setPrereqSearchTerm] = useState("");
  const [enrollmentSearchTerm, setEnrollmentSearchTerm] = useState("");
  
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<StudentCourse | null>(null);
  const [editingCourse, setEditingCourse] = useState<StudentCourse | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [viewingPrereq, setViewingPrereq] = useState<Prerequisite | null>(null);
  
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
  }, []);

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
    e.id.toLowerCase().includes(enrollmentSearchTerm.toLowerCase()) ||
    e.course_id.toLowerCase().includes(enrollmentSearchTerm.toLowerCase())
  );

  const getLessonStatus = (progress: number | null, status: string) => {
    if (status === "completed") return "Completed";
    if (progress === 0) return "Not Started";
    if (progress && progress > 0) return "In Progress";
    return "Not Started";
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Courses</CardTitle>
                  <CardDescription>Manage all available courses</CardDescription>
                </div>
                <Dialog open={isAddCourseDialogOpen} onOpenChange={setIsAddCourseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Course</DialogTitle>
                      <DialogDescription>Enter course details below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Course ID *</Label>
                        <Input
                          placeholder="e.g., CSE-101"
                          value={formData.course_id}
                          onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          placeholder="e.g., Introduction to Python"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Input
                          placeholder="e.g., Programming"
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
                          placeholder="e.g., INS-101"
                          value={formData.instructor_id}
                          onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddCourseDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCourse}>Add Course</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                          <div className="flex gap-1">
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
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(course)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(course.course_id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
              <CardDescription>View course prerequisites</CardDescription>
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

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Prerequisite</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrerequisites.map(prereq => (
                    <TableRow key={prereq.id}>
                      <TableCell>
                        <Badge variant="outline">{prereq.course_id.includes("CSC -") ? prereq.course_id : `CSC - ${prereq.course_id.slice(-3)}`}</Badge>
                      </TableCell>
                      <TableCell>{prereq.prerequisite_text || prereq.prerequisite_course_id || "N/A"}</TableCell>
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
                            <div className="space-y-2">
                              <p><strong>Course ID:</strong> {prereq.course_id.includes("CSC -") ? prereq.course_id : `CSC - ${prereq.course_id.slice(-3)}`}</p>
                              <p><strong>Prerequisite Text:</strong> {prereq.prerequisite_text || "N/A"}</p>
                              <p><strong>Prerequisite Course ID:</strong> {prereq.prerequisite_course_id ? (prereq.prerequisite_course_id.includes("CSC -") ? prereq.prerequisite_course_id : `CSC - ${prereq.prerequisite_course_id.slice(-3)}`) : "N/A"}</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollments Table */}
        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Enrollments</CardTitle>
              <CardDescription>View your course enrollments</CardDescription>
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

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enrollment ID</TableHead>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Lesson Status</TableHead>
                    <TableHead>Time Stamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment, index) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{formatEnrollmentId(enrollment.id, index)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{enrollment.course_id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{enrollment.courses.title}</TableCell>
                      <TableCell>
                        <Badge variant={
                          getLessonStatus(enrollment.progress, enrollment.status) === "Completed" ? "default" :
                          getLessonStatus(enrollment.progress, enrollment.status) === "In Progress" ? "secondary" :
                          "outline"
                        }>
                          {getLessonStatus(enrollment.progress, enrollment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(enrollment.enrolled_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}