import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: string;
  title: string;
  category: string;
  difficulty_level: string | null;
  status: string | null;
  instructor_id: string | null;
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

// Mock data for tables with Course ID format "CSE – 101"
const mockCourses: Course[] = [
  { id: "CSE – 101", title: "Introduction to Python", category: "Programming", difficulty_level: "Beginner", status: "active", instructor_id: "INS – 001" },
  { id: "CSE – 102", title: "Data Science Fundamentals", category: "Data Science", difficulty_level: "Intermediate", status: "active", instructor_id: "INS – 002" },
  { id: "CSE – 103", title: "Machine Learning Basics", category: "AI/ML", difficulty_level: "Advanced", status: "active", instructor_id: "INS – 003" },
  { id: "CSE – 104", title: "Web Development with React", category: "Web Development", difficulty_level: "Intermediate", status: "active", instructor_id: "INS – 001" },
  { id: "CSE – 105", title: "Database Management", category: "Database", difficulty_level: "Beginner", status: "active", instructor_id: "INS – 004" },
];

const mockPrerequisites: Prerequisite[] = [
  { id: "PRE – 001", course_id: "CSE – 102", prerequisite_text: "Basic Python knowledge", prerequisite_course_id: "CSE – 101" },
  { id: "PRE – 002", course_id: "CSE – 103", prerequisite_text: "Data Science Fundamentals", prerequisite_course_id: "CSE – 102" },
  { id: "PRE – 003", course_id: "CSE – 103", prerequisite_text: "Statistics knowledge", prerequisite_course_id: null },
  { id: "PRE – 004", course_id: "CSE – 104", prerequisite_text: "HTML/CSS basics", prerequisite_course_id: null },
  { id: "PRE – 005", course_id: "CSE – 105", prerequisite_text: "Basic computer skills", prerequisite_course_id: null },
];

const mockEnrollments: Enrollment[] = [
  { id: "ENR – 001", course_id: "CSE – 101", enrolled_at: "2024-01-15T10:30:00Z", status: "in_progress", progress: 65, courses: { title: "Introduction to Python", category: "Programming" } },
  { id: "ENR – 002", course_id: "CSE – 102", enrolled_at: "2024-02-20T14:15:00Z", status: "completed", progress: 100, courses: { title: "Data Science Fundamentals", category: "Data Science" } },
  { id: "ENR – 003", course_id: "CSE – 104", enrolled_at: "2024-03-10T09:00:00Z", status: "in_progress", progress: 30, courses: { title: "Web Development with React", category: "Web Development" } },
  { id: "ENR – 004", course_id: "CSE – 105", enrolled_at: "2024-03-25T11:45:00Z", status: "not_started", progress: 0, courses: { title: "Database Management", category: "Database" } },
  { id: "ENR – 005", course_id: "CSE – 103", enrolled_at: "2024-04-01T16:20:00Z", status: "in_progress", progress: 45, courses: { title: "Machine Learning Basics", category: "AI/ML" } },
];

// Helper function to format course ID as "CSC 101" format
const formatCourseId = (id: string, index: number = 0): string => {
  // If already in CSE/CSC format, return as is
  if (id.includes("CSE") || id.includes("CSC")) return id;
  // Convert UUID to a readable format like "CSC 101"
  return `CSC ${101 + index}`;
};

export function MyCourses({ userId }: { userId: string }) {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>(mockPrerequisites);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [prereqSearchTerm, setPrereqSearchTerm] = useState("");
  const [enrollmentSearchTerm, setEnrollmentSearchTerm] = useState("");
  
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [viewingPrereq, setViewingPrereq] = useState<Prerequisite | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchRealData();
  }, [userId]);

  const fetchRealData = async () => {
    // Fetch real courses from Supabase and merge with mock data
    const { data: realCourses } = await supabase
      .from("courses")
      .select("id, title, category, difficulty_level, status, instructor_id");
    
    if (realCourses && realCourses.length > 0) {
      setCourses(realCourses);
    }

    // Fetch real enrollments
    const { data: realEnrollments } = await supabase
      .from("enrollments")
      .select("*, courses(title, category)")
      .eq("user_id", userId);
    
    if (realEnrollments && realEnrollments.length > 0) {
      setEnrollments(realEnrollments as Enrollment[]);
    }

    // Fetch prerequisites
    const { data: realPrereqs } = await supabase
      .from("course_prerequisites")
      .select("*");
    
    if (realPrereqs && realPrereqs.length > 0) {
      setPrerequisites(realPrereqs);
    }

    // Fetch available courses for enrollment
    const { data: allCourses } = await supabase.from("courses").select("*");
    const { data: myEnrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("user_id", userId);

    const enrolledIds = myEnrollments?.map(e => e.course_id) || [];
    const available = (allCourses || []).filter(c => !enrolledIds.includes(c.id));
    setAvailableCourses(available);
  };

  const handleEnroll = async (courseId: string) => {
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, course_id: courseId, status: "not_started" });

    if (error) {
      toast({ title: "Error", description: "Failed to enroll", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Enrolled successfully!" });
      fetchRealData();
      setIsEnrollDialogOpen(false);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete enrollment", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Enrollment deleted successfully" });
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    }
  };

  const filteredCourses = courses.filter(c =>
    c.id.toLowerCase().includes(courseSearchTerm.toLowerCase())
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
              <CardTitle>Courses</CardTitle>
              <CardDescription>Browse all available courses</CardDescription>
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
                  {filteredCourses.map((course, index) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Badge variant="outline">{formatCourseId(course.id, index)}</Badge>
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
                              <p><strong>Course ID:</strong> {formatCourseId(course.id, index)}</p>
                              <p><strong>Title:</strong> {course.title}</p>
                              <p><strong>Category:</strong> {course.category}</p>
                              <p><strong>Difficulty:</strong> {course.difficulty_level || "N/A"}</p>
                              <p><strong>Status:</strong> {course.status || "N/A"}</p>
                              <p><strong>Instructor ID:</strong> {course.instructor_id || "N/A"}</p>
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
                        <Badge variant="outline">{prereq.course_id}</Badge>
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
                              <p><strong>Course ID:</strong> {prereq.course_id}</p>
                              <p><strong>Prerequisite Text:</strong> {prereq.prerequisite_text || "N/A"}</p>
                              <p><strong>Prerequisite Course ID:</strong> {prereq.prerequisite_course_id || "N/A"}</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enrollments</CardTitle>
                  <CardDescription>Manage your course enrollments</CardDescription>
                </div>
                <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Enroll in Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Available Courses</DialogTitle>
                      <DialogDescription>Choose a course to enroll in</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {availableCourses.map(course => (
                        <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">{course.category}</p>
                          </div>
                          <Button onClick={() => handleEnroll(course.id)}>Enroll</Button>
                        </div>
                      ))}
                      {availableCourses.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No available courses to enroll in.</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map(enrollment => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{enrollment.id}</TableCell>
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEnrollment(enrollment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
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