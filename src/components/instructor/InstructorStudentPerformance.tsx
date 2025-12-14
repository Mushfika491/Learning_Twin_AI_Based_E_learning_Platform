import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Sparkles } from "lucide-react";
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
  
  // Mock data for demonstration (5 rows each)
  const mockProfiles: Profile[] = [
    { id: "STU-001-uuid", name: "Alice Johnson", email: "alice.johnson@email.com", phone_number: "+1-555-0101", learning_goals: "Master Python programming", interests: "AI, Data Science", achievements: "Dean's List 2024" },
    { id: "STU-002-uuid", name: "Bob Williams", email: "bob.williams@email.com", phone_number: "+1-555-0102", learning_goals: "Become a full-stack developer", interests: "Web Development, React", achievements: "Hackathon Winner 2024" },
    { id: "STU-003-uuid", name: "Carol Davis", email: "carol.davis@email.com", phone_number: "+1-555-0103", learning_goals: "Data Science certification", interests: "Machine Learning, Statistics", achievements: "Research Publication" },
    { id: "STU-004-uuid", name: "David Martinez", email: "david.martinez@email.com", phone_number: "+1-555-0104", learning_goals: "Build mobile applications", interests: "React Native, Flutter", achievements: "App Store Featured" },
    { id: "STU-005-uuid", name: "Emma Brown", email: "emma.brown@email.com", phone_number: "+1-555-0105", learning_goals: "Learn cloud computing", interests: "AWS, DevOps", achievements: "AWS Certified" },
  ];

  const mockEnrollments: Enrollment[] = [
    { id: "ENR-001", user_id: "STU-001-uuid", course_id: "CRS-001-uuid", progress: 85, enrolled_at: "2025-01-05T10:00:00Z", status: "active" },
    { id: "ENR-002", user_id: "STU-002-uuid", course_id: "CRS-001-uuid", progress: 72, enrolled_at: "2025-01-06T11:00:00Z", status: "active" },
    { id: "ENR-003", user_id: "STU-003-uuid", course_id: "CRS-002-uuid", progress: 100, enrolled_at: "2025-01-07T09:00:00Z", status: "completed" },
    { id: "ENR-004", user_id: "STU-004-uuid", course_id: "CRS-002-uuid", progress: 45, enrolled_at: "2025-01-08T14:00:00Z", status: "active" },
    { id: "ENR-005", user_id: "STU-005-uuid", course_id: "CRS-003-uuid", progress: 60, enrolled_at: "2025-01-09T08:00:00Z", status: "active" },
  ];

  const mockProgress: Progress[] = [
    { progress_id: "PRG-001", student_id: "STU-001-uuid", course_id: "CRS-001-uuid", percentage_completed: 85, time_spent_minutes: 1250, last_accessed: "2025-01-20T15:30:00Z" },
    { progress_id: "PRG-002", student_id: "STU-002-uuid", course_id: "CRS-001-uuid", percentage_completed: 72, time_spent_minutes: 980, last_accessed: "2025-01-19T10:00:00Z" },
    { progress_id: "PRG-003", student_id: "STU-003-uuid", course_id: "CRS-002-uuid", percentage_completed: 100, time_spent_minutes: 2100, last_accessed: "2025-01-18T18:00:00Z" },
    { progress_id: "PRG-004", student_id: "STU-004-uuid", course_id: "CRS-002-uuid", percentage_completed: 45, time_spent_minutes: 560, last_accessed: "2025-01-20T09:00:00Z" },
    { progress_id: "PRG-005", student_id: "STU-005-uuid", course_id: "CRS-003-uuid", percentage_completed: 60, time_spent_minutes: 720, last_accessed: "2025-01-20T12:00:00Z" },
  ];

  const mockPerformanceReports: PerformanceReport[] = [
    { id: "RPT-001", student_id: "STU-001-uuid", course_id: "CRS-001-uuid", strengths: "Excellent problem-solving skills, consistent participation", weakness: "Time management on quizzes", recommendations: "Practice timed exercises, review quiz strategies", generated_at: "2025-01-20T10:00:00Z", risk_level: "Low" },
    { id: "RPT-002", student_id: "STU-002-uuid", course_id: "CRS-001-uuid", strengths: "Strong coding fundamentals, creative solutions", weakness: "Documentation needs improvement", recommendations: "Focus on code comments and README files", generated_at: "2025-01-19T14:00:00Z", risk_level: "Low" },
    { id: "RPT-003", student_id: "STU-003-uuid", course_id: "CRS-002-uuid", strengths: "Outstanding performance, ahead of schedule", weakness: "None identified", recommendations: "Consider advanced courses", generated_at: "2025-01-18T11:00:00Z", risk_level: "Low" },
    { id: "RPT-004", student_id: "STU-004-uuid", course_id: "CRS-002-uuid", strengths: "Good theoretical understanding", weakness: "Practical implementation needs work", recommendations: "Complete more hands-on projects", generated_at: "2025-01-20T08:00:00Z", risk_level: "Medium" },
    { id: "RPT-005", student_id: "STU-005-uuid", course_id: "CRS-003-uuid", strengths: "Quick learner, asks good questions", weakness: "Assignment submission delays", recommendations: "Set earlier personal deadlines", generated_at: "2025-01-19T16:00:00Z", risk_level: "Medium" },
  ];

  const mockCourses: Course[] = [
    { id: "CRS-001-uuid", title: "Introduction to Python" },
    { id: "CRS-002-uuid", title: "Advanced JavaScript" },
    { id: "CRS-003-uuid", title: "Data Science Fundamentals" },
    { id: "CRS-004-uuid", title: "React Development" },
    { id: "CRS-005-uuid", title: "Machine Learning Basics" },
  ];

  // State for performance reports
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

    // Use fetched data or fallback to mock data
    if (coursesData && coursesData.length > 0) {
      setCourses(coursesData);

      const courseIds = coursesData.map(c => c.id);
      // Get enrollments
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("*")
        .in("course_id", courseIds);
      setEnrollments(enrollmentsData && enrollmentsData.length > 0 ? enrollmentsData : mockEnrollments);

      // Get student profiles with additional fields
      const studentIds = [...new Set((enrollmentsData || []).map(e => e.user_id))];
      if (studentIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, email, phone_number, learning_goals, interests, achievements")
          .in("id", studentIds);
        setProfiles(profilesData && profilesData.length > 0 ? profilesData : mockProfiles);
      } else {
        setProfiles(mockProfiles);
      }

      // Get progress data
      const { data: progressData } = await supabase
        .from("progress")
        .select("*")
        .in("course_id", courseIds);
      setProgress(progressData && progressData.length > 0 ? progressData : mockProgress);
    } else {
      // Use mock data when no real data exists
      setCourses(mockCourses);
      setEnrollments(mockEnrollments);
      setProfiles(mockProfiles);
      setProgress(mockProgress);
    }
    
    // Set mock performance reports
    setPerformanceReports(mockPerformanceReports);
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

  const formatCourseId = (courseId: string) => {
    const courseFormats = ["CSC 101", "CSC 201", "CSC 303", "CSC 405", "CSC 210", "CSC 315", "CSC 420", "CSC 150", "CSC 250", "CSC 360"];
    const index = courses.findIndex(c => c.id === courseId);
    return courseFormats[index >= 0 ? index % courseFormats.length : 0];
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
              <div className="overflow-x-auto max-w-full border rounded-md">
                <Table className="min-w-[1200px]">
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
              <div className="overflow-x-auto max-w-full border rounded-md">
                <Table className="min-w-[900px]">
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
                        <TableCell className="font-medium">{formatCourseId(enrollment.course_id)}</TableCell>
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

              <div className="overflow-x-auto max-w-full border rounded-md">
                <Table className="min-w-[1100px]">
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
                        <TableCell className="font-medium">{formatCourseId(report.course_id)}</TableCell>
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
