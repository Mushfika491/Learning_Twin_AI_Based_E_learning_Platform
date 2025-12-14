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
  category: string;
  question_text: string;
  correct_answer: string;
  upload_time: string;
}

interface Assignment {
  id: string;
  title: string;
  assessment_id: string;
  points: number;
  due_date_time: string;
  upload_time: string;
  rubrics: string;
  topic: string;
}

interface StudentAssessmentAnswer {
  id: string;
  student_name: string;
  student_id: string;
  assessment_title: string;
  assessment_id: string;
  assessment_type: string;
  due_date_time: string;
  marks: number;
  submitted_time: string;
  answers: string;
}

export function InstructorContentMaterials() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<StudentAssessmentAnswer[]>([]);
  
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [quizSearchTerm, setQuizSearchTerm] = useState("");
  const [questionSearchTerm, setQuestionSearchTerm] = useState("");
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState("");
  const [studentAnswerSearchTerm, setStudentAnswerSearchTerm] = useState("");
  
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
  
  const { toast } = useToast();

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
    question_type: "multiple_choice",
    category: "",
    question_text: "",
    correct_answer: "",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    assessment_id: "",
    points: 100,
    due_date_time: "",
    rubrics: "",
    topic: "",
  });

  // Mock data for demonstration (5 rows each)
  const mockQuestions: Question[] = [
    { id: "QST-001", assessment_id: "ASM-001", question_number: 1, question_type: "Multiple Choice", category: "Programming Basics", question_text: "What is the correct syntax to declare a variable in Python?", correct_answer: "variable_name = value", upload_time: "2025-01-15T09:00:00Z" },
    { id: "QST-002", assessment_id: "ASM-001", question_number: 2, question_type: "True/False", category: "Data Types", question_text: "In Python, strings are mutable.", correct_answer: "False", upload_time: "2025-01-15T09:15:00Z" },
    { id: "QST-003", assessment_id: "ASM-002", question_number: 1, question_type: "Short Answer", category: "Functions", question_text: "What keyword is used to define a function in JavaScript?", correct_answer: "function", upload_time: "2025-01-16T10:00:00Z" },
    { id: "QST-004", assessment_id: "ASM-002", question_number: 2, question_type: "Multiple Choice", category: "Arrays", question_text: "Which method adds an element to the end of an array?", correct_answer: "push()", upload_time: "2025-01-16T10:30:00Z" },
    { id: "QST-005", assessment_id: "ASM-003", question_number: 1, question_type: "Essay", category: "Data Analysis", question_text: "Explain the difference between supervised and unsupervised learning.", correct_answer: "Supervised uses labeled data...", upload_time: "2025-01-17T14:00:00Z" },
  ];

  const mockAssignments: Assignment[] = [
    { id: "ASG-001", title: "Python Variables Practice", assessment_id: "ASM-001", points: 50, due_date_time: "2025-01-25T23:59:00", upload_time: "2025-01-15T08:00:00Z", rubrics: "Correct syntax, variable naming conventions, code readability", topic: "Variables & Data Types" },
    { id: "ASG-002", title: "JavaScript Functions Project", assessment_id: "ASM-002", points: 100, due_date_time: "2025-01-28T23:59:00", upload_time: "2025-01-16T09:00:00Z", rubrics: "Function implementation, error handling, documentation", topic: "Functions & Methods" },
    { id: "ASG-003", title: "Data Visualization Report", assessment_id: "ASM-003", points: 75, due_date_time: "2025-02-01T23:59:00", upload_time: "2025-01-17T11:00:00Z", rubrics: "Chart accuracy, insights quality, presentation", topic: "Data Visualization" },
    { id: "ASG-004", title: "React Component Building", assessment_id: "ASM-004", points: 80, due_date_time: "2025-02-05T23:59:00", upload_time: "2025-01-18T10:00:00Z", rubrics: "Component structure, state management, props usage", topic: "React Components" },
    { id: "ASG-005", title: "ML Model Training Exercise", assessment_id: "ASM-005", points: 120, due_date_time: "2025-02-10T23:59:00", upload_time: "2025-01-19T13:00:00Z", rubrics: "Model accuracy, feature selection, documentation", topic: "Machine Learning" },
  ];

  const mockStudentAnswers: StudentAssessmentAnswer[] = [
    { id: "SAS-001", student_name: "Alice Johnson", student_id: "STU-001", assessment_title: "Python Variables Practice", assessment_id: "ASM-001", assessment_type: "Assignment", due_date_time: "2025-01-25T23:59:00", marks: 45, submitted_time: "2025-01-24T18:30:00", answers: "Completed all exercises correctly" },
    { id: "SAS-002", student_name: "Bob Williams", student_id: "STU-002", assessment_title: "Python Variables Practice", assessment_id: "ASM-001", assessment_type: "Assignment", due_date_time: "2025-01-25T23:59:00", marks: 48, submitted_time: "2025-01-25T10:15:00", answers: "Excellent variable naming" },
    { id: "SAS-003", student_name: "Carol Davis", student_id: "STU-003", assessment_title: "JavaScript Functions Project", assessment_id: "ASM-002", assessment_type: "Assignment", due_date_time: "2025-01-28T23:59:00", marks: 92, submitted_time: "2025-01-27T20:45:00", answers: "Outstanding implementation" },
    { id: "SAS-004", student_name: "David Martinez", student_id: "STU-004", assessment_title: "Data Visualization Report", assessment_id: "ASM-003", assessment_type: "Assignment", due_date_time: "2025-02-01T23:59:00", marks: 68, submitted_time: "2025-01-31T22:00:00", answers: "Good charts, needs more analysis" },
    { id: "SAS-005", student_name: "Emma Brown", student_id: "STU-005", assessment_title: "React Component Building", assessment_id: "ASM-004", assessment_type: "Assignment", due_date_time: "2025-02-05T23:59:00", marks: 78, submitted_time: "2025-02-04T16:30:00", answers: "Well-structured components" },
  ];

  // Mock content data
  const mockContent: Content[] = [
    { id: "CNT-001", course_id: "c1a2b3c4", type: "Video", title: "Introduction to Python Programming", link: "https://example.com/video1", order_index: 45, created_at: "2025-01-10T08:00:00Z" },
    { id: "CNT-002", course_id: "c1a2b3c4", type: "Document", title: "Python Syntax Guide", link: "https://example.com/doc1", order_index: 30, created_at: "2025-01-11T09:00:00Z" },
    { id: "CNT-003", course_id: "c2b3c4d5", type: "Video", title: "JavaScript ES6 Features", link: "https://example.com/video2", order_index: 60, created_at: "2025-01-12T10:00:00Z" },
    { id: "CNT-004", course_id: "c2b3c4d5", type: "Slides", title: "Async/Await Deep Dive", link: "https://example.com/slides1", order_index: 50, created_at: "2025-01-13T11:00:00Z" },
    { id: "CNT-005", course_id: "c3c4d5e6", type: "Video", title: "Data Analysis with Pandas", link: "https://example.com/video3", order_index: 75, created_at: "2025-01-14T12:00:00Z" },
  ];

  // Mock quizzes data
  const mockQuizzes: Quiz[] = [
    { quiz_id: "QZ-001", course_id: "c1a2b3c4", title: "Python Basics Quiz", total_marks: 50, difficulty_level: "Beginner", created_at: "2025-01-12T08:00:00Z" },
    { quiz_id: "QZ-002", course_id: "c1a2b3c4", title: "Python Data Structures Quiz", total_marks: 75, difficulty_level: "Intermediate", created_at: "2025-01-14T09:00:00Z" },
    { quiz_id: "QZ-003", course_id: "c2b3c4d5", title: "JavaScript Fundamentals", total_marks: 60, difficulty_level: "Beginner", created_at: "2025-01-15T10:00:00Z" },
    { quiz_id: "QZ-004", course_id: "c2b3c4d5", title: "Advanced JavaScript Patterns", total_marks: 100, difficulty_level: "Advanced", created_at: "2025-01-16T11:00:00Z" },
    { quiz_id: "QZ-005", course_id: "c3c4d5e6", title: "Data Science Concepts", total_marks: 80, difficulty_level: "Intermediate", created_at: "2025-01-17T12:00:00Z" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("instructor_id", session.user.id);

    setCourses(coursesData || []);

    const courseIds = (coursesData || []).map(c => c.id);
    if (courseIds.length > 0) {
      const { data: contentData } = await supabase
        .from("content")
        .select("*")
        .in("course_id", courseIds)
        .order("order_index");
      setContent(contentData && contentData.length > 0 ? contentData : mockContent);

      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });
      setQuizzes(quizzesData && quizzesData.length > 0 ? quizzesData : mockQuizzes);
    } else {
      // Use mock data when no real data exists
      setContent(mockContent);
      setQuizzes(mockQuizzes);
    }
    
    // Set mock data for questions, assignments, and student answers
    setQuestions(mockQuestions);
    setAssignments(mockAssignments);
    setStudentAnswers(mockStudentAnswers);
  };

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

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      ...questionForm,
      upload_time: new Date().toISOString(),
    };
    
    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? { ...newQuestion, id: editingQuestion.id } : q));
      toast({ title: "Success", description: "Question updated" });
    } else {
      setQuestions([...questions, newQuestion]);
      toast({ title: "Success", description: "Question created" });
    }
    resetQuestionForm();
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: `as${Date.now()}`,
      ...assignmentForm,
      upload_time: new Date().toISOString(),
    };
    
    if (editingAssignment) {
      setAssignments(assignments.map(a => a.id === editingAssignment.id ? { ...newAssignment, id: editingAssignment.id } : a));
      toast({ title: "Success", description: "Assignment updated" });
    } else {
      setAssignments([...assignments, newAssignment]);
      toast({ title: "Success", description: "Assignment created" });
    }
    resetAssignmentForm();
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

  const handleDeleteQuestion = () => {
    if (!deleteQuestionId) return;
    setQuestions(questions.filter(q => q.id !== deleteQuestionId));
    toast({ title: "Success", description: "Question deleted" });
    setDeleteQuestionId(null);
  };

  const handleDeleteAssignment = () => {
    if (!deleteAssignmentId) return;
    setAssignments(assignments.filter(a => a.id !== deleteAssignmentId));
    toast({ title: "Success", description: "Assignment deleted" });
    setDeleteAssignmentId(null);
  };

  const resetContentForm = () => {
    setContentForm({ course_id: "", type: "document", title: "", link: "", order_index: 0 });
    setEditingContent(null);
    setIsContentDialogOpen(false);
  };

  const resetQuizForm = () => {
    setQuizForm({ course_id: "", title: "", total_marks: 100, difficulty_level: "Intermediate" });
    setEditingQuiz(null);
    setIsQuizDialogOpen(false);
  };

  const resetQuestionForm = () => {
    setQuestionForm({ assessment_id: "", question_number: 1, question_type: "multiple_choice", category: "", question_text: "", correct_answer: "" });
    setEditingQuestion(null);
    setIsQuestionDialogOpen(false);
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({ title: "", assessment_id: "", points: 100, due_date_time: "", rubrics: "", topic: "" });
    setEditingAssignment(null);
    setIsAssignmentDialogOpen(false);
  };

  const formatCourseId = (courseId: string, index?: number) => {
    const courseIndex = index !== undefined ? index : courses.findIndex(c => c.id === courseId);
    const num = courseIndex >= 0 ? 101 + courseIndex : 101;
    return `CSC – ${num}`;
  };

  const filteredContent = content.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(materialSearchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || c.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.quiz_id.toLowerCase().includes(quizSearchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || q.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredQuestions = questions.filter(q => 
    q.id.toLowerCase().includes(questionSearchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(a => 
    a.assessment_id.toLowerCase().includes(assignmentSearchTerm.toLowerCase())
  );

  const filteredStudentAnswers = studentAnswers.filter(sa => 
    sa.assessment_id.toLowerCase().includes(studentAnswerSearchTerm.toLowerCase())
  );

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
          <TabsTrigger value="studentAnswers">Student Assessment Answers</TabsTrigger>
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
                  {filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell>{item.order_index} mins</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-right">
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
                  placeholder="Search by Assessment ID..."
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
                  {filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz.quiz_id}>
                      <TableCell className="font-mono text-sm">{quiz.quiz_id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.total_marks}</TableCell>
                      <TableCell>30 mins</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{quiz.difficulty_level || "-"}</TableCell>
                      <TableCell>{quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-right">
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
                <CardDescription>Manage quiz questions</CardDescription>
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
                  placeholder="Search by Question ID..."
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
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-mono text-sm">{question.id}</TableCell>
                      <TableCell className="font-mono text-sm">{question.assessment_id}</TableCell>
                      <TableCell>{question.question_number}</TableCell>
                      <TableCell>{question.question_type}</TableCell>
                      <TableCell>{question.category}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{question.question_text}</TableCell>
                      <TableCell>{question.correct_answer}</TableCell>
                      <TableCell>{new Date(question.upload_time).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingQuestion(question);
                          setQuestionForm({
                            assessment_id: question.assessment_id,
                            question_number: question.question_number,
                            question_type: question.question_type,
                            category: question.category,
                            question_text: question.question_text,
                            correct_answer: question.correct_answer,
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
                  placeholder="Search by Assessment ID..."
                  value={assignmentSearchTerm}
                  onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Due Date Time</TableHead>
                    <TableHead>Upload Time</TableHead>
                    <TableHead>Rubrics</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell className="font-mono text-sm">{assignment.assessment_id}</TableCell>
                      <TableCell>{assignment.points}</TableCell>
                      <TableCell>{new Date(assignment.due_date_time).toLocaleString()}</TableCell>
                      <TableCell>{new Date(assignment.upload_time).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{assignment.rubrics}</TableCell>
                      <TableCell>{assignment.topic}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingAssignment(assignment);
                          setAssignmentForm({
                            title: assignment.title,
                            assessment_id: assignment.assessment_id,
                            points: assignment.points,
                            due_date_time: assignment.due_date_time,
                            rubrics: assignment.rubrics,
                            topic: assignment.topic,
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

        {/* Student Assessment Answers Tab */}
        <TabsContent value="studentAnswers">
          <Card>
            <CardHeader>
              <CardTitle>Student Assessment Answers</CardTitle>
              <CardDescription>View student submissions and answers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Assessment ID..."
                  value={studentAnswerSearchTerm}
                  onChange={(e) => setStudentAnswerSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Assessment Title</TableHead>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Assessment Type</TableHead>
                    <TableHead>Due Date Time</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Submitted Time</TableHead>
                    <TableHead>Answers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudentAnswers.map((answer) => (
                    <TableRow key={answer.id}>
                      <TableCell className="font-medium">{answer.student_name}</TableCell>
                      <TableCell className="font-mono text-sm">{answer.student_id}</TableCell>
                      <TableCell>{answer.assessment_title}</TableCell>
                      <TableCell className="font-mono text-sm">{answer.assessment_id}</TableCell>
                      <TableCell>{answer.assessment_type}</TableCell>
                      <TableCell>{new Date(answer.due_date_time).toLocaleString()}</TableCell>
                      <TableCell>{answer.marks}</TableCell>
                      <TableCell>{new Date(answer.submitted_time).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStudentAnswers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No student answers found
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
                <Label>Question Number</Label>
                <Input type="number" value={questionForm.question_number} onChange={(e) => setQuestionForm({ ...questionForm, question_number: parseInt(e.target.value) || 1 })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={questionForm.question_type} onValueChange={(v) => setQuestionForm({ ...questionForm, question_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={questionForm.category} onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Input value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Input value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} required />
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
                <Input value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Assessment ID</Label>
                <Input value={assignmentForm.assessment_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, assessment_id: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" value={assignmentForm.points} onChange={(e) => setAssignmentForm({ ...assignmentForm, points: parseInt(e.target.value) || 100 })} required />
              </div>
              <div className="space-y-2">
                <Label>Due Date Time</Label>
                <Input type="datetime-local" value={assignmentForm.due_date_time} onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date_time: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input value={assignmentForm.topic} onChange={(e) => setAssignmentForm({ ...assignmentForm, topic: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Rubrics</Label>
              <Input value={assignmentForm.rubrics} onChange={(e) => setAssignmentForm({ ...assignmentForm, rubrics: e.target.value })} required />
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
    </div>
  );
}
