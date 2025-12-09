import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Course {
  id: string;
  title: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number | null;
  enrolled_at: string | null;
  status: string | null;
}

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface Progress {
  progress_id: string;
  student_id: string;
  course_id: string;
  percentage_completed: number | null;
  time_spent_minutes: number | null;
  last_accessed: string | null;
}

export function InstructorStudentPerformance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get instructor's courses
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("instructor_id", session.user.id);

    setCourses(coursesData || []);

    const courseIds = (coursesData || []).map(c => c.id);
    if (courseIds.length > 0) {
      // Get enrollments
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("*")
        .in("course_id", courseIds);
      setEnrollments(enrollmentsData || []);

      // Get student profiles
      const studentIds = [...new Set((enrollmentsData || []).map(e => e.user_id))];
      if (studentIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", studentIds);
        setProfiles(profilesData || []);
      }

      // Get progress data
      const { data: progressData } = await supabase
        .from("progress")
        .select("*")
        .in("course_id", courseIds);
      setProgress(progressData || []);
    }
  };

  const getStudentName = (studentId: string) => {
    const profile = profiles.find(p => p.id === studentId);
    return profile?.name || "Unknown";
  };

  const getStudentEmail = (studentId: string) => {
    const profile = profiles.find(p => p.id === studentId);
    return profile?.email || "-";
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || "Unknown";
  };

  const getProgressForStudent = (studentId: string, courseId: string) => {
    return progress.find(p => p.student_id === studentId && p.course_id === courseId);
  };

  // Unique students
  const uniqueStudents = [...new Set(enrollments.map(e => e.user_id))];

  const filteredStudents = uniqueStudents.filter(studentId => {
    const name = getStudentName(studentId).toLowerCase();
    const email = getStudentEmail(studentId).toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = getStudentName(e.user_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || e.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Chart data: enrollment count per course
  const enrollmentChartData = courses.map(course => ({
    course: course.title.substring(0, 12),
    students: enrollments.filter(e => e.course_id === course.id).length,
  }));

  // Avg progress per course
  const avgProgressData = courses.map(course => {
    const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
    const avgProg = courseEnrollments.length > 0
      ? Math.round(courseEnrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / courseEnrollments.length)
      : 0;
    return { course: course.title.substring(0, 12), progress: avgProg };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students & Performance</h1>
        <p className="text-muted-foreground">View student enrollments and performance metrics</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{uniqueStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
              <p className="text-2xl font-bold">{enrollments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrollments by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Progress by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={avgProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Student List</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>All students enrolled in your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Courses Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(studentId => {
                    const studentEnrollments = enrollments.filter(e => e.user_id === studentId);
                    return (
                      <TableRow key={studentId}>
                        <TableCell className="font-medium">{getStudentName(studentId)}</TableCell>
                        <TableCell>{getStudentEmail(studentId)}</TableCell>
                        <TableCell>{studentEnrollments.length}</TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Details</CardTitle>
              <CardDescription>Detailed enrollment and progress information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map(enrollment => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">{getStudentName(enrollment.user_id)}</TableCell>
                      <TableCell>{getCourseName(enrollment.course_id)}</TableCell>
                      <TableCell>{enrollment.progress || 0}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${enrollment.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"}`}>
                          {enrollment.status || "active"}
                        </span>
                      </TableCell>
                      <TableCell>{enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {filteredEnrollments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No enrollments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
