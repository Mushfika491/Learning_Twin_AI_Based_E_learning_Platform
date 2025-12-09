import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, FileText, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

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
  phone_number: string | null;
  learning_goals: string | null;
  interests: string | null;
  achievements: string | null;
}

interface Progress {
  progress_id: string;
  student_id: string;
  course_id: string;
  percentage_completed: number | null;
  time_spent_minutes: number | null;
  last_accessed: string | null;
}

interface PerformanceReport {
  id: string;
  student_id: string;
  course_id: string;
  strengths: string;
  weakness: string;
  recommendations: string;
  generated_at: string;
  risk_level: string;
}

export function InstructorStudentPerformance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  
  // Search terms for each table
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [enrollmentSearchTerm, setEnrollmentSearchTerm] = useState("");
  const [reportSearchTerm, setReportSearchTerm] = useState("");
  
  // Mock performance reports (UI-only for now)
  const [performanceReports, setPerformanceReports] = useState<PerformanceReport[]>([]);

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

      // Get student profiles with additional fields
      const studentIds = [...new Set((enrollmentsData || []).map(e => e.user_id))];
      if (studentIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, email, phone_number, learning_goals, interests, achievements")
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

  const getStudentProfile = (studentId: string) => {
    return profiles.find(p => p.id === studentId);
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || "Unknown";
  };

  const getProgressForStudent = (studentId: string, courseId: string) => {
    return progress.find(p => p.student_id === studentId && p.course_id === courseId);
  };

  const getCompletedCoursesCount = (studentId: string) => {
    return enrollments.filter(e => e.user_id === studentId && e.status === "completed").length;
  };

  const getAvgScore = (studentId: string) => {
    const studentEnrollments = enrollments.filter(e => e.user_id === studentId);
    if (studentEnrollments.length === 0) return 0;
    const total = studentEnrollments.reduce((acc, e) => acc + (e.progress || 0), 0);
    return Math.round(total / studentEnrollments.length);
  };

  const getTimeSpent = (studentId: string, courseId: string) => {
    const prog = progress.find(p => p.student_id === studentId && p.course_id === courseId);
    return prog?.time_spent_minutes || 0;
  };

  // Unique students
  const uniqueStudents = [...new Set(enrollments.map(e => e.user_id))];

  // Filter students by Student ID
  const filteredStudents = uniqueStudents.filter(studentId => {
    return studentId.toLowerCase().includes(studentSearchTerm.toLowerCase());
  });

  // Filter enrollments by Student ID
  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = e.user_id.toLowerCase().includes(enrollmentSearchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || e.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Filter performance reports by Student ID
  const filteredReports = performanceReports.filter(r => {
    return r.student_id.toLowerCase().includes(reportSearchTerm.toLowerCase());
  });

  // Generate performance report
  const handleGenerateReport = (studentId: string, courseId: string) => {
    const existingReport = performanceReports.find(
      r => r.student_id === studentId && r.course_id === courseId
    );

    const newReport: PerformanceReport = {
      id: existingReport?.id || crypto.randomUUID(),
      student_id: studentId,
      course_id: courseId,
      strengths: "Good engagement, consistent progress",
      weakness: "Needs improvement in quiz scores",
      recommendations: "Focus on practice exercises and review materials",
      generated_at: new Date().toISOString(),
      risk_level: Math.random() > 0.5 ? "Low" : "Medium"
    };

    if (existingReport) {
      setPerformanceReports(prev => prev.map(r => 
        r.id === existingReport.id ? newReport : r
      ));
      toast.success("Performance report updated!");
    } else {
      setPerformanceReports(prev => [...prev, newReport]);
      toast.success("Performance report generated!");
    }
  };

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
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollment</TabsTrigger>
          <TabsTrigger value="performance">Performance Report</TabsTrigger>
        </TabsList>

        {/* Students Table */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>All students enrolled in your courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Student ID..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Enrollment Status</TableHead>
                      <TableHead>Academic Level</TableHead>
                      <TableHead>Subscription Type</TableHead>
                      <TableHead>Learning Goal</TableHead>
                      <TableHead>Completed Courses</TableHead>
                      <TableHead>Avg Scores</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Achievements</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(studentId => {
                      const profile = getStudentProfile(studentId);
                      const studentEnrollments = enrollments.filter(e => e.user_id === studentId);
                      const hasActive = studentEnrollments.some(e => e.status === "active");
                      return (
                        <TableRow key={studentId}>
                          <TableCell className="font-medium">{profile?.name || "Unknown"}</TableCell>
                          <TableCell className="font-mono text-xs">{studentId.substring(0, 8)}...</TableCell>
                          <TableCell>{profile?.phone_number || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${hasActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-muted text-muted-foreground"}`}>
                              {hasActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>Undergraduate</TableCell>
                          <TableCell>Standard</TableCell>
                          <TableCell className="max-w-32 truncate">{profile?.learning_goals || "-"}</TableCell>
                          <TableCell>{getCompletedCoursesCount(studentId)}</TableCell>
                          <TableCell>{getAvgScore(studentId)}%</TableCell>
                          <TableCell className="max-w-32 truncate">{profile?.interests || "-"}</TableCell>
                          <TableCell className="max-w-32 truncate">{profile?.achievements || "-"}</TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Table */}
        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
              <CardDescription>Detailed enrollment and progress information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Student ID..."
                  value={enrollmentSearchTerm}
                  onChange={(e) => setEnrollmentSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Percentage Completion</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Lesson Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map(enrollment => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-mono text-xs">{enrollment.user_id.substring(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-xs">{enrollment.course_id.substring(0, 8)}...</TableCell>
                        <TableCell>{enrollment.progress || 0}%</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${enrollment.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"}`}>
                            {enrollment.status || "active"}
                          </span>
                        </TableCell>
                        <TableCell>{enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{getTimeSpent(enrollment.user_id, enrollment.course_id)} mins</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${(enrollment.progress || 0) >= 100 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : (enrollment.progress || 0) > 0 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : "bg-muted text-muted-foreground"}`}>
                            {(enrollment.progress || 0) >= 100 ? "Completed" : (enrollment.progress || 0) > 0 ? "In Progress" : "Not Started"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEnrollments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No enrollments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Report Table */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Performance Report
              </CardTitle>
              <CardDescription>Student performance analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Student ID..."
                    value={reportSearchTerm}
                    onChange={(e) => setReportSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
              
              {/* Generate Report Section */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Generate New Report</h4>
                <div className="flex flex-wrap gap-2">
                  {filteredEnrollments.slice(0, 5).map(enrollment => (
                    <Button
                      key={enrollment.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReport(enrollment.user_id, enrollment.course_id)}
                      className="flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      {getStudentName(enrollment.user_id).substring(0, 10)} - {getCourseName(enrollment.course_id).substring(0, 15)}
                    </Button>
                  ))}
                  {filteredEnrollments.length === 0 && (
                    <p className="text-sm text-muted-foreground">No enrollments available for report generation</p>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Perf Report ID</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Strengths</TableHead>
                      <TableHead>Weakness</TableHead>
                      <TableHead>Recommendations</TableHead>
                      <TableHead>Generated At</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-xs">{report.id.substring(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-xs">{report.student_id.substring(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-xs">{report.course_id.substring(0, 8)}...</TableCell>
                        <TableCell className="max-w-32 truncate">{report.strengths}</TableCell>
                        <TableCell className="max-w-32 truncate">{report.weakness}</TableCell>
                        <TableCell className="max-w-40 truncate">{report.recommendations}</TableCell>
                        <TableCell>{new Date(report.generated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            report.risk_level === "Low" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                              : report.risk_level === "Medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}>
                            {report.risk_level}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredReports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No performance reports generated yet. Use the buttons above to generate reports.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
