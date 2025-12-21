import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Search, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

interface Course {
  id: string;
  title: string;
}

interface Content {
  id: string;
  course_id: string;
  type: string;
  title: string;
  link: string | null;
  order_index: number | null;
  created_at: string | null;
}

interface Quiz {
  quiz_id: string;
  course_id: string;
  title: string;
  total_marks: number;
  difficulty_level: string | null;
  created_at: string | null;
}

interface Question {
  id: string;
  assessment_id: string;
  question_number: number;
  question_type: string;
  category: string | null;
  question_text: string;
  correct_answer: string | null;
  course_id: string | null;
  created_at: string | null;
}

interface Assignment {
  id: string;
  student_id: string;
  assessment_id: string;
  assessment_type: string;
  assessment_title: string;
  course_id: string | null;
  total_marks: number;
  obtained_mark: number | null;
  due_date_time: string | null;
  status: string | null;
  performance_level: string | null;
  feedback: string | null;
  created_at: string | null;
}

interface StudentSubmission {
  id: string;
  student_id: string;
  assessment_id: string;
  answer: string;
  status: string;
  created_at: string | null;
  student_name?: string;
}

export function InstructorContentMaterials() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [quizSearchTerm, setQuizSearchTerm] = useState("");
  const [questionSearchTerm, setQuestionSearchTerm] = useState("");
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState("");
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState("");
  
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(null);
  
  // View detail states
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  
  const { toast } = useToast();

  // Helper to generate next ID in format PREFIX-XXX
  const generateNextId = (prefix: string, existingItems: { assessment_id?: string; id?: string }[], idField: 'assessment_id' | 'id' = 'assessment_id') => {
    const existingIds = existingItems
      .map(item => item[idField] || '')
      .filter(id => id.startsWith(prefix))
      .map(id => {
        const num = parseInt(id.replace(`${prefix}-`, ''));
        return isNaN(num) ? 0 : num;
      });
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `${prefix}-${String(maxId + 1).padStart(3, '0')}`;
  };

  const [contentForm, setContentForm] = useState({
    course_id: "",
    type: "document",
    title: "",
    link: "",
    order_index: 0,
  });

  const [quizForm, setQuizForm] = useState({
    course_id: "",
    title: "",
    total_marks: 100,
    difficulty_level: "Intermediate",
  });

  const [questionForm, setQuestionForm] = useState({
    assessment_id: "",
    question_number: 1,
    question_type: "MCQ",
    category: "",
    question_text: "",
    correct_answer: "",
    course_id: "",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    assessment_id: "",
    assessment_title: "",
    assessment_type: "Assignment",
    course_id: "",
    total_marks: 100,
    due_date_time: "",
    student_id: "00000000-0000-0000-0000-000000000000",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // Fetch courses
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("instructor_id", session.user.id);
    setCourses(coursesData || []);

    const courseIds = (coursesData || []).map(c => c.id);
    
    if (courseIds.length > 0) {
      // Fetch content
      const { data: contentData } = await supabase
        .from("content")
        .select("*")
        .in("course_id", courseIds)
        .order("order_index");
      setContent(contentData || []);

      // Fetch quizzes
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });
      setQuizzes(quizzesData || []);
    }

    // Fetch questions from assessment_questions table
    const { data: questionsData } = await supabase
      .from("assessment_questions")
      .select("*")
      .order("created_at", { ascending: false });
    setQuestions(questionsData || []);

    // Fetch assignments from student_assessments table
    const { data: assignmentsData } = await supabase
      .from("student_assessments")
      .select("*")
      .order("created_at", { ascending: false });
    setAssignments(assignmentsData || []);

    // Fetch student submissions
    const { data: submissionsData } = await supabase
      .from("student_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    
    // Get student names for submissions
    if (submissionsData && submissionsData.length > 0) {
      const studentIds = [...new Set(submissionsData.map(s => s.student_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", studentIds);
      
      const profileMap = new Map(profilesData?.map(p => [p.id, p.name]) || []);
      const submissionsWithNames = submissionsData.map(s => ({
        ...s,
        student_name: profileMap.get(s.student_id) || "Unknown Student"
      }));
      setStudentSubmissions(submissionsWithNames);
    } else {
      setStudentSubmissions([]);
    }

    setLoading(false);
  };

  // Content CRUD
  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingContent) {
      const { error } = await supabase
        .from("content")
        .update(contentForm)
        .eq("id", editingContent.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update content", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Content updated" });
        fetchData();
        resetContentForm();
      }
    } else {
      const { error } = await supabase
        .from("content")
        .insert([contentForm]);

      if (error) {
        toast({ title: "Error", description: "Failed to create content", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Content created" });
        fetchData();
        resetContentForm();
      }
    }
  };

  const handleDeleteContent = async () => {
    if (!deleteContentId) return;
    const { error } = await supabase.from("content").delete().eq("id", deleteContentId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Content deleted" });
      fetchData();
    }
    setDeleteContentId(null);
  };

  // Quiz CRUD
  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingQuiz) {
      const { error } = await supabase
        .from("quizzes")
        .update(quizForm)
        .eq("quiz_id", editingQuiz.quiz_id);

      if (error) {
        toast({ title: "Error", description: "Failed to update quiz", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Quiz updated" });
        fetchData();
        resetQuizForm();
      }
    } else {
      const { error } = await supabase
        .from("quizzes")
        .insert([quizForm]);

      if (error) {
        toast({ title: "Error", description: "Failed to create quiz", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Quiz created" });
        fetchData();
        resetQuizForm();
      }
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizId) return;
    const { error } = await supabase.from("quizzes").delete().eq("quiz_id", deleteQuizId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Quiz deleted" });
      fetchData();
    }
    setDeleteQuizId(null);
  };

  // Question CRUD
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionData = {
      assessment_id: questionForm.assessment_id,
      question_number: questionForm.question_number,
      question_type: questionForm.question_type,
      category: questionForm.category || null,
      question_text: questionForm.question_text,
      correct_answer: questionForm.correct_answer || null,
      course_id: questionForm.course_id || null,
    };

    if (editingQuestion) {
      const { error } = await supabase
        .from("assessment_questions")
        .update(questionData)
        .eq("id", editingQuestion.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update question", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Question updated" });
        fetchData();
        resetQuestionForm();
      }
    } else {
      const { error } = await supabase
        .from("assessment_questions")
        .insert([questionData]);

      if (error) {
        toast({ title: "Error", description: "Failed to create question", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Question created" });
        fetchData();
        resetQuestionForm();
      }
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionId) return;
    const { error } = await supabase.from("assessment_questions").delete().eq("id", deleteQuestionId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete question", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Question deleted" });
      fetchData();
    }
    setDeleteQuestionId(null);
  };

  // Assignment CRUD
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assignmentData = {
      assessment_id: assignmentForm.assessment_id,
      assessment_title: assignmentForm.assessment_title,
      assessment_type: assignmentForm.assessment_type,
      course_id: assignmentForm.course_id || null,
      total_marks: assignmentForm.total_marks,
      due_date_time: assignmentForm.due_date_time || null,
      student_id: assignmentForm.student_id,
    };

    if (editingAssignment) {
      const { error } = await supabase
        .from("student_assessments")
        .update(assignmentData)
        .eq("id", editingAssignment.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update assignment", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Assignment updated" });
        fetchData();
        resetAssignmentForm();
      }
    } else {
      const { error } = await supabase
        .from("student_assessments")
        .insert([assignmentData]);

      if (error) {
        toast({ title: "Error", description: "Failed to create assignment", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Assignment created" });
        fetchData();
        resetAssignmentForm();
      }
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteAssignmentId) return;
    const { error } = await supabase.from("student_assessments").delete().eq("id", deleteAssignmentId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete assignment", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Assignment deleted" });
      fetchData();
    }
    setDeleteAssignmentId(null);
  };

  // Reset forms
  const resetContentForm = () => {
    setContentForm({ 
      course_id: courses.length > 0 ? courses[0].id : "", 
      type: "document", 
      title: "", 
      link: "", 
      order_index: 30 
    });
    setEditingContent(null);
    setIsContentDialogOpen(false);
  };

  const resetQuizForm = () => {
    setQuizForm({ 
      course_id: courses.length > 0 ? courses[0].id : "", 
      title: "", 
      total_marks: 100, 
      difficulty_level: "Intermediate" 
    });
    setEditingQuiz(null);
    setIsQuizDialogOpen(false);
  };

  const resetQuestionForm = () => {
    const nextAssessmentId = generateNextId('ASM', questions);
    setQuestionForm({ 
      assessment_id: nextAssessmentId, 
      question_number: 1, 
      question_type: "MCQ", 
      category: "", 
      question_text: "", 
      correct_answer: "", 
      course_id: "" 
    });
    setEditingQuestion(null);
    setIsQuestionDialogOpen(false);
  };

  const resetAssignmentForm = () => {
    const nextAssessmentId = generateNextId('ASM', assignments);
    setAssignmentForm({ 
      assessment_id: nextAssessmentId, 
      assessment_title: "", 
      assessment_type: "Assignment", 
      course_id: "", 
      total_marks: 100, 
      due_date_time: "", 
      student_id: "00000000-0000-0000-0000-000000000000" 
    });
    setEditingAssignment(null);
    setIsAssignmentDialogOpen(false);
  };

  // Formatting functions
  const formatContentId = (id: string, index: number) => {
    return `CNT – ${String(index + 1).padStart(3, "0")}`;
  };

  const formatQuizId = (id: string, index: number) => {
    return `QZ – ${String(index + 1).padStart(3, "0")}`;
  };

  const formatQuestionId = (id: string, index: number) => {
    return `QST – ${String(index + 1).padStart(3, "0")}`;
  };

  const formatAssignmentId = (id: string, index: number) => {
    return `ASG – ${String(index + 1).padStart(3, "0")}`;
  };

  const formatSubmissionId = (id: string, index: number) => {
    return `SUB – ${String(index + 1).padStart(3, "0")}`;
  };

  const formatStudentId = (id: string, index: number) => {
    return `STU – ${String(index + 1).padStart(3, "0")}`;
  };

  const getCourseTitle = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.title || courseId;
  };

  const getAssignmentTitle = (assessmentId: string) => {
    const assignment = assignments.find(a => a.assessment_id === assessmentId);
    return assignment?.assessment_title || assessmentId;
  };

  // Filters
  const filteredContent = content.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(materialSearchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || c.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(quizSearchTerm.toLowerCase()) ||
      (q.difficulty_level || "").toLowerCase().includes(quizSearchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || q.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredQuestions = questions.filter(q => {
    const searchLower = questionSearchTerm.toLowerCase();
    return q.assessment_id.toLowerCase().includes(searchLower) ||
      q.question_text.toLowerCase().includes(searchLower) ||
      (q.category || "").toLowerCase().includes(searchLower) ||
      q.question_type.toLowerCase().includes(searchLower);
  });

  const filteredAssignments = assignments.filter(a => {
    const searchLower = assignmentSearchTerm.toLowerCase();
    return a.assessment_id.toLowerCase().includes(searchLower) ||
      a.assessment_title.toLowerCase().includes(searchLower) ||
      a.assessment_type.toLowerCase().includes(searchLower) ||
      (a.course_id || "").toLowerCase().includes(searchLower);
  });

  const filteredSubmissions = studentSubmissions.filter(s => {
    const searchLower = submissionSearchTerm.toLowerCase();
    return s.assessment_id.toLowerCase().includes(searchLower) ||
      (s.student_name || "").toLowerCase().includes(searchLower) ||
      s.answer.toLowerCase().includes(searchLower) ||
      s.status.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content & Materials</h1>
          <p className="text-muted-foreground">Manage course content, quizzes, and assignments</p>
        </div>
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

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials">Lecture Materials</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Assignments</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Student Assessment Answers</TabsTrigger>
        </TabsList>

        {/* Lecture Materials Tab */}
        <TabsContent value="materials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lecture Materials</CardTitle>
                <CardDescription>Videos, documents, and links</CardDescription>
              </div>
              <Button onClick={() => { resetContentForm(); setIsContentDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Title..."
                  value={materialSearchTerm}
                  onChange={(e) => setMaterialSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Lecture Duration</TableHead>
                    <TableHead>File Count</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{formatContentId(item.id, index)}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell>{item.order_index} mins</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedContent(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingContent(item);
                          setContentForm({
                            course_id: item.course_id,
                            type: item.type,
                            title: item.title,
                            link: item.link || "",
                            order_index: item.order_index || 0,
                          });
                          setIsContentDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteContentId(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredContent.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No content found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Assignments Tab */}
        <TabsContent value="quizzes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quiz Assignments</CardTitle>
                <CardDescription>Manage course quizzes</CardDescription>
              </div>
              <Button onClick={() => { resetQuizForm(); setIsQuizDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Quiz
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Title or Topic..."
                  value={quizSearchTerm}
                  onChange={(e) => setQuizSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Files Count</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.map((quiz, index) => (
                    <TableRow key={quiz.quiz_id}>
                      <TableCell className="font-mono text-sm">{formatQuizId(quiz.quiz_id, index)}</TableCell>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.total_marks}</TableCell>
                      <TableCell>30 mins</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{quiz.difficulty_level || "-"}</TableCell>
                      <TableCell>{quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedQuiz(quiz)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingQuiz(quiz);
                          setQuizForm({
                            course_id: quiz.course_id,
                            title: quiz.title,
                            total_marks: quiz.total_marks,
                            difficulty_level: quiz.difficulty_level || "Intermediate",
                          });
                          setIsQuizDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteQuizId(quiz.quiz_id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredQuizzes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No quizzes found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Manage assessment questions</CardDescription>
              </div>
              <Button onClick={() => { resetQuestionForm(); setIsQuestionDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={questionSearchTerm}
                  onChange={(e) => setQuestionSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question ID</TableHead>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Question Number</TableHead>
                    <TableHead>Question Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Question Text</TableHead>
                    <TableHead>Correct Answer</TableHead>
                    <TableHead>Upload Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-mono text-sm">{formatQuestionId(question.id, index)}</TableCell>
                      <TableCell className="font-mono text-sm">{question.assessment_id}</TableCell>
                      <TableCell>{question.question_number}</TableCell>
                      <TableCell>{question.question_type}</TableCell>
                      <TableCell>{question.category || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{question.question_text}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{question.correct_answer || "-"}</TableCell>
                      <TableCell>{question.created_at ? new Date(question.created_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedQuestion(question)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingQuestion(question);
                          setQuestionForm({
                            assessment_id: question.assessment_id,
                            question_number: question.question_number,
                            question_type: question.question_type,
                            category: question.category || "",
                            question_text: question.question_text,
                            correct_answer: question.correct_answer || "",
                            course_id: question.course_id || "",
                          });
                          setIsQuestionDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteQuestionId(question.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No questions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Manage course assignments</CardDescription>
              </div>
              <Button onClick={() => { resetAssignmentForm(); setIsAssignmentDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={assignmentSearchTerm}
                  onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment, index) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-mono text-sm">{formatAssignmentId(assignment.id, index)}</TableCell>
                      <TableCell className="font-medium">{assignment.assessment_title}</TableCell>
                      <TableCell className="font-mono text-sm">{assignment.assessment_id}</TableCell>
                      <TableCell>{assignment.assessment_type}</TableCell>
                      <TableCell>{assignment.total_marks}</TableCell>
                      <TableCell>{assignment.due_date_time ? new Date(assignment.due_date_time).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          assignment.status === "Graded" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          assignment.status === "Submitted" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {assignment.status || "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedAssignment(assignment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingAssignment(assignment);
                          setAssignmentForm({
                            assessment_id: assignment.assessment_id,
                            assessment_title: assignment.assessment_title,
                            assessment_type: assignment.assessment_type,
                            course_id: assignment.course_id || "",
                            total_marks: assignment.total_marks,
                            due_date_time: assignment.due_date_time ? new Date(assignment.due_date_time).toISOString().slice(0, 16) : "",
                            student_id: assignment.student_id,
                          });
                          setIsAssignmentDialogOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteAssignmentId(assignment.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAssignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No assignments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Submissions Tab */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Student Assessment Answers</CardTitle>
              <CardDescription>View student submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={submissionSearchTerm}
                  onChange={(e) => setSubmissionSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Assessment Title</TableHead>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission, index) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-sm">{formatSubmissionId(submission.id, index)}</TableCell>
                      <TableCell className="font-medium">{submission.student_name}</TableCell>
                      <TableCell className="font-mono text-sm">{formatStudentId(submission.student_id, index)}</TableCell>
                      <TableCell>{getAssignmentTitle(submission.assessment_id)}</TableCell>
                      <TableCell className="font-mono text-sm">{submission.assessment_id}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{submission.answer}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          submission.status === "Submitted" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell>{submission.created_at ? new Date(submission.created_at).toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(submission)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No submissions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContent ? "Edit Material" : "Add Material"}</DialogTitle>
            <DialogDescription>
              {editingContent ? "Update material details" : "Add new course material"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={contentForm.course_id} onValueChange={(v) => setContentForm({ ...contentForm, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={contentForm.type} onValueChange={(v) => setContentForm({ ...contentForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Link/URL</Label>
              <Input type="url" value={contentForm.link} onChange={(e) => setContentForm({ ...contentForm, link: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Lecture Duration (mins)</Label>
              <Input type="number" value={contentForm.order_index} onChange={(e) => setContentForm({ ...contentForm, order_index: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetContentForm}>Cancel</Button>
              <Button type="submit">{editingContent ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingQuiz ? "Edit Quiz" : "Add Quiz"}</DialogTitle>
            <DialogDescription>
              {editingQuiz ? "Update quiz details" : "Create a new quiz"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuizSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={quizForm.course_id} onValueChange={(v) => setQuizForm({ ...quizForm, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input type="number" value={quizForm.total_marks} onChange={(e) => setQuizForm({ ...quizForm, total_marks: parseInt(e.target.value) || 100 })} />
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={quizForm.difficulty_level} onValueChange={(v) => setQuizForm({ ...quizForm, difficulty_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetQuizForm}>Cancel</Button>
              <Button type="submit">{editingQuiz ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Update question details" : "Create a new question"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assessment ID</Label>
                <Input value={questionForm.assessment_id} onChange={(e) => setQuestionForm({ ...questionForm, assessment_id: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Course ID</Label>
                <Input value={questionForm.course_id} onChange={(e) => setQuestionForm({ ...questionForm, course_id: e.target.value })} placeholder="e.g., CSE-101" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Number</Label>
                <Input type="number" value={questionForm.question_number} onChange={(e) => setQuestionForm({ ...questionForm, question_number: parseInt(e.target.value) || 1 })} required />
              </div>
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={questionForm.question_type} onValueChange={(v) => setQuestionForm({ ...questionForm, question_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">Multiple Choice</SelectItem>
                    <SelectItem value="Short Q">Short Answer</SelectItem>
                    <SelectItem value="Coding">Coding</SelectItem>
                    <SelectItem value="Essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={questionForm.category} onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })} placeholder="e.g., Basics, Functions, Data Types" />
            </div>
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Input value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Input value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetQuestionForm}>Cancel</Button>
              <Button type="submit">{editingQuestion ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? "Edit Assignment" : "Add Assignment"}</DialogTitle>
            <DialogDescription>
              {editingAssignment ? "Update assignment details" : "Create a new assignment"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={assignmentForm.assessment_title} onChange={(e) => setAssignmentForm({ ...assignmentForm, assessment_title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Assessment ID</Label>
                <Input value={assignmentForm.assessment_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, assessment_id: e.target.value })} required placeholder="e.g., ASM-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assessment Type</Label>
                <Select value={assignmentForm.assessment_type} onValueChange={(v) => setAssignmentForm({ ...assignmentForm, assessment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course ID</Label>
                <Input value={assignmentForm.course_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, course_id: e.target.value })} placeholder="e.g., CSE-101" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input type="number" value={assignmentForm.total_marks} onChange={(e) => setAssignmentForm({ ...assignmentForm, total_marks: parseInt(e.target.value) || 100 })} required />
              </div>
              <div className="space-y-2">
                <Label>Due Date Time</Label>
                <Input type="datetime-local" value={assignmentForm.due_date_time} onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date_time: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetAssignmentForm}>Cancel</Button>
              <Button type="submit">{editingAssignment ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
      <DeleteConfirmDialog
        open={!!deleteContentId}
        onOpenChange={() => setDeleteContentId(null)}
        onConfirm={handleDeleteContent}
        title="Delete Content"
        description="Are you sure you want to delete this content?"
      />
      <DeleteConfirmDialog
        open={!!deleteQuizId}
        onOpenChange={() => setDeleteQuizId(null)}
        onConfirm={handleDeleteQuiz}
        title="Delete Quiz"
        description="Are you sure you want to delete this quiz?"
      />
      <DeleteConfirmDialog
        open={!!deleteQuestionId}
        onOpenChange={() => setDeleteQuestionId(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question"
        description="Are you sure you want to delete this question?"
      />
      <DeleteConfirmDialog
        open={!!deleteAssignmentId}
        onOpenChange={() => setDeleteAssignmentId(null)}
        onConfirm={handleDeleteAssignment}
        title="Delete Assignment"
        description="Are you sure you want to delete this assignment?"
      />

      {/* Content Detail Modal */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Content ID</Label>
                <p className="font-medium">{formatContentId(selectedContent.id, filteredContent.findIndex(c => c.id === selectedContent.id))}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedContent.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Topic</Label>
                <p className="font-medium capitalize">{selectedContent.type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Duration</Label>
                <p className="font-medium">{selectedContent.order_index} mins</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Link</Label>
                <p className="font-medium">{selectedContent.link || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Upload Date</Label>
                <p className="font-medium">{selectedContent.created_at ? new Date(selectedContent.created_at).toLocaleDateString() : "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Detail Modal */}
      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quiz Details</DialogTitle>
          </DialogHeader>
          {selectedQuiz && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Quiz ID</Label>
                <p className="font-medium">{formatQuizId(selectedQuiz.quiz_id, filteredQuizzes.findIndex(q => q.quiz_id === selectedQuiz.quiz_id))}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedQuiz.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Course</Label>
                <p className="font-medium">{getCourseTitle(selectedQuiz.course_id)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Points</Label>
                <p className="font-medium">{selectedQuiz.total_marks}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Difficulty Level</Label>
                <p className="font-medium">{selectedQuiz.difficulty_level || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Upload Date</Label>
                <p className="font-medium">{selectedQuiz.created_at ? new Date(selectedQuiz.created_at).toLocaleDateString() : "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Question Detail Modal */}
      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Question ID</Label>
                <p className="font-medium">{formatQuestionId(selectedQuestion.id, filteredQuestions.findIndex(q => q.id === selectedQuestion.id))}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Assessment ID</Label>
                <p className="font-medium">{selectedQuestion.assessment_id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Course ID</Label>
                <p className="font-medium">{selectedQuestion.course_id || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Question Number</Label>
                <p className="font-medium">{selectedQuestion.question_number}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Question Type</Label>
                <p className="font-medium">{selectedQuestion.question_type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="font-medium">{selectedQuestion.category || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Question Text</Label>
                <p className="font-medium">{selectedQuestion.question_text}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Correct Answer</Label>
                <p className="font-medium">{selectedQuestion.correct_answer || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Upload Date</Label>
                <p className="font-medium">{selectedQuestion.created_at ? new Date(selectedQuestion.created_at).toLocaleDateString() : "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assignment Detail Modal */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Assignment ID</Label>
                <p className="font-medium">{formatAssignmentId(selectedAssignment.id, filteredAssignments.findIndex(a => a.id === selectedAssignment.id))}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedAssignment.assessment_title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Assessment ID</Label>
                <p className="font-medium">{selectedAssignment.assessment_id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="font-medium">{selectedAssignment.assessment_type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Course ID</Label>
                <p className="font-medium">{selectedAssignment.course_id || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Marks</Label>
                <p className="font-medium">{selectedAssignment.total_marks}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Obtained Marks</Label>
                <p className="font-medium">{selectedAssignment.obtained_mark || 0}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Due Date</Label>
                <p className="font-medium">{selectedAssignment.due_date_time ? new Date(selectedAssignment.due_date_time).toLocaleString() : "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-medium">{selectedAssignment.status || "Pending"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Performance Level</Label>
                <p className="font-medium">{selectedAssignment.performance_level || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Feedback</Label>
                <p className="font-medium">{selectedAssignment.feedback || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission Detail Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Submission ID</Label>
                <p className="font-medium">{formatSubmissionId(selectedSubmission.id, filteredSubmissions.findIndex(s => s.id === selectedSubmission.id))}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Student Name</Label>
                <p className="font-medium">{selectedSubmission.student_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Assessment ID</Label>
                <p className="font-medium">{selectedSubmission.assessment_id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Assessment Title</Label>
                <p className="font-medium">{getAssignmentTitle(selectedSubmission.assessment_id)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Answer</Label>
                <p className="font-medium">{selectedSubmission.answer}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-medium">{selectedSubmission.status}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Submitted Time</Label>
                <p className="font-medium">{selectedSubmission.created_at ? new Date(selectedSubmission.created_at).toLocaleString() : "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
