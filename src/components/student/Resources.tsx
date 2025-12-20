import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StudentCourse {
  course_id: string;
  title: string;
  category: string;
  difficulty_level: string | null;
  status: string | null;
  instructor_id: string | null;
  created_at: string | null;
}

interface Assessment {
  id: string;
  assessment_id: string;
  student_id: string;
  course_id: string | null;
  assessment_type: string;
  assessment_title: string;
  obtained_mark: number;
  total_marks: number;
  due_date_time: string | null;
  performance_level: string | null;
  feedback: string | null;
  status: string | null;
  created_at: string | null;
}

interface Question {
  id: string;
  assessment_id: string;
  course_id: string | null;
  question_number: number;
  question_type: string;
  question_text: string;
  category: string | null;
  correct_answer: string | null;
  created_at: string | null;
}

interface Submission {
  id: string;
  assessment_id: string;
  answer: string;
  status: string;
  student_id: string;
  created_at: string | null;
}

export function Resources({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("course-materials");
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [courseSearch, setCourseSearch] = useState("");
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [addSubmissionDialogOpen, setAddSubmissionDialogOpen] = useState(false);
  const [addAssessmentDialogOpen, setAddAssessmentDialogOpen] = useState(false);
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [newSubmission, setNewSubmission] = useState({ assessment_id: "", answer: "" });
  const [newAssessment, setNewAssessment] = useState({
    assessment_id: "",
    assessment_type: "Quiz",
    assessment_title: "",
    total_marks: 100,
    due_date_time: "",
  });
  const [newQuestion, setNewQuestion] = useState({
    assessment_id: "",
    question_number: 1,
    question_type: "MCQ",
    question_text: "",
    category: "",
    correct_answer: "",
  });

  useEffect(() => {
    fetchCourses();
    fetchAssessments();
    fetchQuestions();
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    const { data, error } = await supabase
      .from("student_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Fetch submissions error:", error);
      toast({ title: "Error", description: "Failed to fetch submissions", variant: "destructive" });
    } else {
      setSubmissions(data || []);
    }
    setSubmissionsLoading(false);
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

  const fetchAssessments = async () => {
    setAssessmentsLoading(true);
    
    // Fetch all assessments (sample data for demo)
    const { data, error } = await supabase
      .from("student_assessments")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Fetch assessments error:", error);
      toast({ title: "Error", description: "Failed to fetch assessments", variant: "destructive" });
    } else {
      setAssessments(data || []);
    }
    setAssessmentsLoading(false);
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    const { data, error } = await supabase
      .from("assessment_questions")
      .select("*")
      .order("assessment_id", { ascending: true });
    
    if (error) {
      console.error("Fetch questions error:", error);
      toast({ title: "Error", description: "Failed to fetch questions", variant: "destructive" });
    } else {
      setQuestions(data || []);
    }
    setQuestionsLoading(false);
  };

  const handleAddAssessment = async () => {
    if (!newAssessment.assessment_id || !newAssessment.assessment_title) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("student_assessments").insert({
      assessment_id: newAssessment.assessment_id,
      student_id: session.user.id,
      assessment_type: newAssessment.assessment_type,
      assessment_title: newAssessment.assessment_title,
      total_marks: newAssessment.total_marks,
      due_date_time: newAssessment.due_date_time || null,
    });

    if (error) {
      console.error("Add assessment error:", error);
      toast({ title: "Error", description: "Failed to add assessment: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Assessment added successfully" });
      setAddAssessmentDialogOpen(false);
      setNewAssessment({ assessment_id: "", assessment_type: "Quiz", assessment_title: "", total_marks: 100, due_date_time: "" });
      fetchAssessments();
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.assessment_id || !newQuestion.question_text) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("assessment_questions").insert({
      assessment_id: newQuestion.assessment_id,
      question_number: newQuestion.question_number,
      question_type: newQuestion.question_type,
      question_text: newQuestion.question_text,
      category: newQuestion.category || null,
      correct_answer: newQuestion.correct_answer || null,
    });

    if (error) {
      console.error("Add question error:", error);
      toast({ title: "Error", description: "Failed to add question: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Question added successfully" });
      setAddQuestionDialogOpen(false);
      setNewQuestion({ assessment_id: "", question_number: 1, question_type: "MCQ", question_text: "", category: "", correct_answer: "" });
      fetchQuestions();
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    const { error } = await supabase.from("student_assessments").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete assessment", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Assessment deleted" });
      fetchAssessments();
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const { error } = await supabase.from("assessment_questions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete question", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Question deleted" });
      fetchQuestions();
    }
  };

  const handleViewCourse = (course: StudentCourse) => {
    setSelectedCourse(course);
    setCourseDialogOpen(true);
  };

  const handleViewAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setAssessmentDialogOpen(true);
  };

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setQuestionDialogOpen(true);
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setSubmissionDialogOpen(true);
  };

  const handleAddSubmission = async () => {
    if (!newSubmission.assessment_id || !newSubmission.answer) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("student_submissions").insert({
      assessment_id: newSubmission.assessment_id,
      answer: newSubmission.answer,
      status: "Submitted",
      student_id: session.user.id,
    });

    if (error) {
      console.error("Add submission error:", error);
      toast({ title: "Error", description: "Failed to add submission: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Submission added successfully" });
      setAddSubmissionDialogOpen(false);
      setNewSubmission({ assessment_id: "", answer: "" });
      fetchSubmissions();
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    const { error } = await supabase.from("student_submissions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete submission", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Submission deleted" });
      fetchSubmissions();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Graded": return "bg-green-500/20 text-green-700 border-green-500/30";
      case "Submitted": return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      case "Not Submitted": return "bg-red-500/20 text-red-700 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case "Excellent": return "bg-green-500/20 text-green-700 border-green-500/30";
      case "Good": return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      case "Pending": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredCourses = courses.filter(course =>
    course.course_id.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredAssessments = assessments.filter(item =>
    item.assessment_id.toLowerCase().includes(assessmentSearch.toLowerCase())
  );

  const filteredQuestions = questions.filter(item =>
    item.assessment_id.toLowerCase().includes(questionSearch.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(item =>
    item.assessment_id.toLowerCase().includes(submissionSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="course-materials">Lecture Materials</TabsTrigger>
          <TabsTrigger value="my-assessments">My Assessments</TabsTrigger>
          <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="course-materials" className="space-y-6 mt-6">
          {/* Courses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>All available courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Course ID..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
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
                      <TableHead>Details</TableHead>
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
                          <Button size="sm" variant="ghost" onClick={() => handleViewCourse(course)}>
                            <Eye className="h-4 w-4" />
                          </Button>
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
        </TabsContent>

        <TabsContent value="my-assessments" className="space-y-6 mt-6">
          {/* Assessment Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assessment</CardTitle>
                <CardDescription>Your quizzes and assignments with grades</CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddAssessmentDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Assessment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Assessment ID..."
                    value={assessmentSearch}
                    onChange={(e) => setAssessmentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              {assessmentsLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading assessments...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment ID</TableHead>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Assessment Type</TableHead>
                      <TableHead>Assessment Title</TableHead>
                      <TableHead>Obtained Mark</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Due Date & Time</TableHead>
                      <TableHead>Performance Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.assessment_id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{assessment.course_id || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{assessment.assessment_type}</Badge>
                        </TableCell>
                        <TableCell>{assessment.assessment_title}</TableCell>
                        <TableCell>{assessment.obtained_mark}</TableCell>
                        <TableCell>{assessment.total_marks}</TableCell>
                        <TableCell>{assessment.due_date_time || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={getPerformanceColor(assessment.performance_level || "Pending")}>
                            {assessment.performance_level || "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(assessment.status || "Not Submitted")}>
                            {assessment.status || "Not Submitted"}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleViewAssessment(assessment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteAssessment(assessment.id)}>
                            ✕
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAssessments.length === 0 && !assessmentsLoading && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground py-4">
                          No assessments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Questions Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Questions from your assessments</CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddQuestionDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Question
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Assessment ID..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              {questionsLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading questions...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment ID</TableHead>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Question Number</TableHead>
                      <TableHead>Question Type</TableHead>
                      <TableHead>Question Text</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.assessment_id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{question.course_id || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>{question.question_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{question.question_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{question.question_text}</TableCell>
                        <TableCell>{question.category || "N/A"}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleViewQuestion(question)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteQuestion(question.id)}>
                            ✕
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredQuestions.length === 0 && !questionsLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                          No questions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-submissions" className="space-y-6 mt-6">
          {/* Submissions Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>Your submitted answers</CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddSubmissionDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Submission
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Assessment ID..."
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              {submissionsLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading submissions...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment ID</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.assessment_id}</TableCell>
                        <TableCell className="max-w-xs truncate">{submission.answer || "No answer"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleViewSubmission(submission)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteSubmission(submission.id)}>
                            ✕
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSubmissions.length === 0 && !submissionsLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          No submissions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Detail Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>Detailed view of the course</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Course ID</p>
                  <p className="font-medium">{selectedCourse.course_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedCourse.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedCourse.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty Level</p>
                  <Badge variant="outline">{selectedCourse.difficulty_level || "N/A"}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedCourse.status === "active" ? "default" : "secondary"}>
                    {selectedCourse.status || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instructor ID</p>
                  <p className="font-medium">{selectedCourse.instructor_id || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{selectedCourse.created_at || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assessment Detail Dialog */}
      <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
            <DialogDescription>Full summary of assessment {selectedAssessment?.assessment_id}</DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment ID</p>
                  <p className="font-medium">{selectedAssessment.assessment_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assessment Type</p>
                  <p className="font-medium">{selectedAssessment.assessment_type}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Assessment Title</p>
                  <p className="font-medium">{selectedAssessment.assessment_title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Obtained Mark</p>
                  <p className="font-medium">{selectedAssessment.obtained_mark} / {selectedAssessment.total_marks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date & Time</p>
                  <p className="font-medium">{selectedAssessment.due_date_time || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance Level</p>
                  <Badge className={getPerformanceColor(selectedAssessment.performance_level || "Pending")}>
                    {selectedAssessment.performance_level || "Pending"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedAssessment.status || "Not Submitted")}>
                    {selectedAssessment.status || "Not Submitted"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Feedback</p>
                  <p className="font-medium bg-muted p-3 rounded-md">{selectedAssessment.feedback || "No feedback yet"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Question Detail Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>Full summary of question from {selectedQuestion?.assessment_id}</DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment ID</p>
                  <p className="font-medium">{selectedQuestion.assessment_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Question Number</p>
                  <p className="font-medium">{selectedQuestion.question_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Question Type</p>
                  <Badge variant="outline">{selectedQuestion.question_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedQuestion.category || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Question Text</p>
                  <p className="font-medium bg-muted p-3 rounded-md">{selectedQuestion.question_text}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Correct Answer</p>
                  <p className="font-medium bg-green-500/10 p-3 rounded-md border border-green-500/20">{selectedQuestion.correct_answer || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission Detail Dialog */}
      <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>Full summary of submission for {selectedSubmission?.assessment_id}</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment ID</p>
                  <p className="font-medium">{selectedSubmission.assessment_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Answer</p>
                  <p className="font-medium bg-muted p-3 rounded-md">{selectedSubmission.answer || "No answer submitted yet"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Submission Dialog */}
      <Dialog open={addSubmissionDialogOpen} onOpenChange={setAddSubmissionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Submission</DialogTitle>
            <DialogDescription>Submit your answer for an assessment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessmentId">Assessment ID</Label>
              <Input
                id="assessmentId"
                placeholder="Enter Assessment ID (e.g., asm-001)"
                value={newSubmission.assessment_id}
                onChange={(e) => setNewSubmission({ ...newSubmission, assessment_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter your answer (max 120 characters)..."
                value={newSubmission.answer}
                onChange={(e) => setNewSubmission({ ...newSubmission, answer: e.target.value.slice(0, 120) })}
                rows={4}
                maxLength={120}
              />
              <p className="text-xs text-muted-foreground">{newSubmission.answer.length}/120 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubmissionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmission}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Assessment Dialog */}
      <Dialog open={addAssessmentDialogOpen} onOpenChange={setAddAssessmentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Assessment</DialogTitle>
            <DialogDescription>Create a new assessment entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessmentIdNew">Assessment ID</Label>
              <Input
                id="assessmentIdNew"
                placeholder="Enter Assessment ID (e.g., ASM-001)"
                value={newAssessment.assessment_id}
                onChange={(e) => setNewAssessment({ ...newAssessment, assessment_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessmentType">Assessment Type</Label>
              <Input
                id="assessmentType"
                placeholder="Quiz, Assignment, etc."
                value={newAssessment.assessment_type}
                onChange={(e) => setNewAssessment({ ...newAssessment, assessment_type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessmentTitle">Assessment Title</Label>
              <Input
                id="assessmentTitle"
                placeholder="Enter assessment title"
                value={newAssessment.assessment_title}
                onChange={(e) => setNewAssessment({ ...newAssessment, assessment_title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                placeholder="100"
                value={newAssessment.total_marks}
                onChange={(e) => setNewAssessment({ ...newAssessment, total_marks: parseInt(e.target.value) || 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDateTime">Due Date & Time</Label>
              <Input
                id="dueDateTime"
                type="datetime-local"
                value={newAssessment.due_date_time}
                onChange={(e) => setNewAssessment({ ...newAssessment, due_date_time: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAssessmentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAssessment}>Add Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={addQuestionDialogOpen} onOpenChange={setAddQuestionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>Create a new question for an assessment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questionAssessmentId">Assessment ID</Label>
              <Input
                id="questionAssessmentId"
                placeholder="Enter Assessment ID (e.g., ASM-001)"
                value={newQuestion.assessment_id}
                onChange={(e) => setNewQuestion({ ...newQuestion, assessment_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionNumber">Question Number</Label>
              <Input
                id="questionNumber"
                type="number"
                placeholder="1"
                value={newQuestion.question_number}
                onChange={(e) => setNewQuestion({ ...newQuestion, question_number: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionType">Question Type</Label>
              <Input
                id="questionType"
                placeholder="MCQ, Short Q, etc."
                value={newQuestion.question_type}
                onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                placeholder="Enter question text..."
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionCategory">Category</Label>
              <Input
                id="questionCategory"
                placeholder="Enter category"
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Textarea
                id="correctAnswer"
                placeholder="Enter correct answer..."
                value={newQuestion.correct_answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddQuestionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuestion}>Add Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
