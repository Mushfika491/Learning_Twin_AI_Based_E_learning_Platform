import { useState } from "react";
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

interface ContentItem {
  contentId: string;
  courseId: string;
  title: string;
  topic: string;
  uploadDate: string;
}

interface CourseMaterial {
  courseId: string;
  lectureSlideNum: string;
  lectureDuration: string;
}

interface ContentFile {
  contentId: string;
  contentType: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  fileLocation: string;
  uploadTime: string;
}

interface Assessment {
  assessmentId: string;
  assessmentType: string;
  assessmentTitle: string;
  obtainedMark: number;
  totalMarks: number;
  dueDateTime: string;
  performanceLevel: string;
  feedback: string;
  status: string;
}

interface Question {
  assessmentId: string;
  questionNumber: number;
  questionType: string;
  questionText: string;
  category: string;
  correctAnswer: string;
}

interface Submission {
  assessmentId: string;
  studentId: string;
  answer: string;
  status: string;
}

const mockSubmissions: Submission[] = [
  { assessmentId: "ASM – 001", studentId: "STU – 001", answer: "A variable is a named storage location in memory that holds data values.", status: "Submitted" },
  { assessmentId: "ASM – 002", studentId: "STU – 001", answer: "Implemented linked list with insert, delete, and traverse operations using Node class.", status: "Submitted" },
  { assessmentId: "ASM – 003", studentId: "STU – 001", answer: "", status: "Not Submitted" },
  { assessmentId: "ASM – 004", studentId: "STU – 001", answer: "Created responsive website with HTML5, CSS3, and JavaScript including mobile navigation.", status: "Submitted" },
  { assessmentId: "ASM – 005", studentId: "STU – 001", answer: "Time complexity analysis: O(n log n) for merge sort, O(n²) for bubble sort.", status: "Submitted" },
];

const mockContent: ContentItem[] = [
  { contentId: "CNT – 001", courseId: "CSE – 101", title: "Introduction to Programming", topic: "Variables & Data Types", uploadDate: "2024-01-15" },
  { contentId: "CNT – 002", courseId: "CSE – 102", title: "Data Structures Basics", topic: "Arrays & Linked Lists", uploadDate: "2024-01-18" },
  { contentId: "CNT – 003", courseId: "CSE – 103", title: "Database Fundamentals", topic: "SQL Queries", uploadDate: "2024-01-20" },
  { contentId: "CNT – 004", courseId: "CSE – 101", title: "Control Structures", topic: "Loops & Conditions", uploadDate: "2024-01-22" },
  { contentId: "CNT – 005", courseId: "CSE – 104", title: "Web Development Intro", topic: "HTML & CSS Basics", uploadDate: "2024-01-25" },
];

const mockCourseMaterials: CourseMaterial[] = [
  { courseId: "CSE – 101", lectureSlideNum: "Slide 1-25", lectureDuration: "45 mins" },
  { courseId: "CSE – 102", lectureSlideNum: "Slide 1-30", lectureDuration: "60 mins" },
  { courseId: "CSE – 103", lectureSlideNum: "Slide 1-20", lectureDuration: "40 mins" },
  { courseId: "CSE – 104", lectureSlideNum: "Slide 1-35", lectureDuration: "55 mins" },
  { courseId: "CSE – 105", lectureSlideNum: "Slide 1-28", lectureDuration: "50 mins" },
];

const mockContentFiles: ContentFile[] = [
  { contentId: "CNT – 001", contentType: "Lecture", fileName: "intro_programming.pdf", fileType: "PDF", fileSize: "2.5 MB", fileLocation: "/lectures/cse101/", uploadTime: "2024-01-15 09:30" },
  { contentId: "CNT – 002", contentType: "Video", fileName: "data_structures.mp4", fileType: "MP4", fileSize: "150 MB", fileLocation: "/videos/cse102/", uploadTime: "2024-01-18 14:15" },
  { contentId: "CNT – 003", contentType: "Document", fileName: "sql_guide.docx", fileType: "DOCX", fileSize: "1.2 MB", fileLocation: "/docs/cse103/", uploadTime: "2024-01-20 11:00" },
  { contentId: "CNT – 004", contentType: "Lecture", fileName: "control_flow.pptx", fileType: "PPTX", fileSize: "5.8 MB", fileLocation: "/lectures/cse101/", uploadTime: "2024-01-22 16:45" },
  { contentId: "CNT – 005", contentType: "Code", fileName: "html_examples.zip", fileType: "ZIP", fileSize: "3.1 MB", fileLocation: "/code/cse104/", uploadTime: "2024-01-25 10:20" },
];

const mockAssessments: Assessment[] = [
  { assessmentId: "ASM – 001", assessmentType: "Quiz", assessmentTitle: "Programming Basics Quiz", obtainedMark: 85, totalMarks: 100, dueDateTime: "2024-02-10 23:59", performanceLevel: "Excellent", feedback: "Great understanding of core concepts", status: "Graded" },
  { assessmentId: "ASM – 002", assessmentType: "Assignment", assessmentTitle: "Data Structures Assignment 1", obtainedMark: 72, totalMarks: 80, dueDateTime: "2024-02-15 23:59", performanceLevel: "Good", feedback: "Well structured code, minor improvements needed", status: "Graded" },
  { assessmentId: "ASM – 003", assessmentType: "Quiz", assessmentTitle: "SQL Fundamentals Quiz", obtainedMark: 0, totalMarks: 50, dueDateTime: "2024-02-20 23:59", performanceLevel: "Pending", feedback: "Not yet submitted", status: "Not Submitted" },
  { assessmentId: "ASM – 004", assessmentType: "Assignment", assessmentTitle: "Web Development Project", obtainedMark: 45, totalMarks: 50, dueDateTime: "2024-02-25 23:59", performanceLevel: "Excellent", feedback: "Outstanding work with responsive design", status: "Graded" },
  { assessmentId: "ASM – 005", assessmentType: "Quiz", assessmentTitle: "Algorithm Analysis Quiz", obtainedMark: 0, totalMarks: 100, dueDateTime: "2024-03-01 23:59", performanceLevel: "Pending", feedback: "Awaiting grading", status: "Submitted" },
];

const mockQuestions: Question[] = [
  { assessmentId: "ASM – 001", questionNumber: 1, questionType: "MCQ", questionText: "What is a variable in programming?", category: "Basics", correctAnswer: "A named storage location in memory" },
  { assessmentId: "ASM – 001", questionNumber: 2, questionType: "Short Q", questionText: "Explain the difference between int and float data types", category: "Data Types", correctAnswer: "Int stores whole numbers, float stores decimal numbers" },
  { assessmentId: "ASM – 002", questionNumber: 1, questionType: "MCQ", questionText: "Which data structure uses LIFO principle?", category: "Data Structures", correctAnswer: "Stack" },
  { assessmentId: "ASM – 003", questionNumber: 1, questionType: "Short Q", questionText: "Write a SQL query to select all records from a table", category: "SQL Basics", correctAnswer: "SELECT * FROM table_name" },
  { assessmentId: "ASM – 004", questionNumber: 1, questionType: "MCQ", questionText: "What does HTML stand for?", category: "Web Basics", correctAnswer: "HyperText Markup Language" },
];

export function Resources({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("course-materials");
  const [contentSearch, setContentSearch] = useState("");
  const [materialsSearch, setMaterialsSearch] = useState("");
  const [filesSearch, setFilesSearch] = useState("");
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [addSubmissionDialogOpen, setAddSubmissionDialogOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [newSubmission, setNewSubmission] = useState({ studentId: "", assessmentId: "", answer: "" });

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

  const handleAddSubmission = () => {
    if (!newSubmission.studentId || !newSubmission.assessmentId || !newSubmission.answer) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    const submission: Submission = {
      studentId: newSubmission.studentId,
      assessmentId: newSubmission.assessmentId,
      answer: newSubmission.answer,
      status: "Submitted"
    };
    setSubmissions([...submissions, submission]);
    setNewSubmission({ studentId: "", assessmentId: "", answer: "" });
    setAddSubmissionDialogOpen(false);
    toast({ title: "Success", description: "Submission added successfully" });
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

  const filteredContent = mockContent.filter(item =>
    item.courseId.toLowerCase().includes(contentSearch.toLowerCase())
  );

  const filteredMaterials = mockCourseMaterials.filter(item =>
    item.courseId.toLowerCase().includes(materialsSearch.toLowerCase())
  );

  const filteredFiles = mockContentFiles.filter(item =>
    item.contentId.toLowerCase().includes(filesSearch.toLowerCase())
  );

  const filteredAssessments = mockAssessments.filter(item =>
    item.assessmentId.toLowerCase().includes(assessmentSearch.toLowerCase())
  );

  const filteredQuestions = mockQuestions.filter(item =>
    item.assessmentId.toLowerCase().includes(questionSearch.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(item =>
    item.assessmentId.toLowerCase().includes(submissionSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="course-materials">Course Materials</TabsTrigger>
          <TabsTrigger value="my-assessments">My Assessments</TabsTrigger>
          <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="course-materials" className="space-y-6 mt-6">
          {/* Content Table */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Course content and learning materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Course ID..."
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content ID</TableHead>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => (
                    <TableRow key={item.contentId}>
                      <TableCell className="font-medium">{item.contentId}</TableCell>
                      <TableCell>{item.courseId}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.topic}</TableCell>
                      <TableCell>{item.uploadDate}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Course Materials Table */}
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
              <CardDescription>Lecture slides and materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Course ID..."
                    value={materialsSearch}
                    onChange={(e) => setMaterialsSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Lecture Slide Num</TableHead>
                    <TableHead>Lecture Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.courseId}</TableCell>
                      <TableCell>{item.lectureSlideNum}</TableCell>
                      <TableCell>{item.lectureDuration}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Content Files Table */}
          <Card>
            <CardHeader>
              <CardTitle>Content Files</CardTitle>
              <CardDescription>Uploaded files and resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Content ID..."
                    value={filesSearch}
                    onChange={(e) => setFilesSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content ID</TableHead>
                    <TableHead>Content Type</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>File Type</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>File Location</TableHead>
                    <TableHead>Upload Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((item) => (
                    <TableRow key={item.contentId}>
                      <TableCell className="font-medium">{item.contentId}</TableCell>
                      <TableCell>{item.contentType}</TableCell>
                      <TableCell>{item.fileName}</TableCell>
                      <TableCell>{item.fileType}</TableCell>
                      <TableCell>{item.fileSize}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.fileLocation}</TableCell>
                      <TableCell>{item.uploadTime}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-assessments" className="space-y-6 mt-6">
          {/* Assessment Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment</CardTitle>
              <CardDescription>Your quizzes and assignments with grades</CardDescription>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment ID</TableHead>
                      <TableHead>Assessment Type (Assignment/Quiz)</TableHead>
                      <TableHead>Assessment Title</TableHead>
                      <TableHead>Obtained Mark</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Due Date & Time</TableHead>
                      <TableHead>Performance Level</TableHead>
                      <TableHead>Feedback (Text)</TableHead>
                      <TableHead>Status (Submitted/Not Submitted/Graded)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((item) => (
                      <TableRow key={item.assessmentId}>
                        <TableCell className="font-medium">{item.assessmentId}</TableCell>
                        <TableCell>{item.assessmentType}</TableCell>
                        <TableCell>{item.assessmentTitle}</TableCell>
                        <TableCell>{item.obtainedMark}</TableCell>
                        <TableCell>{item.totalMarks}</TableCell>
                        <TableCell>{item.dueDateTime}</TableCell>
                        <TableCell>{item.performanceLevel}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.feedback}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => handleViewAssessment(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Question Table */}
          <Card>
            <CardHeader>
              <CardTitle>Question</CardTitle>
              <CardDescription>Assessment questions and answers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Question ID..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Question Number</TableHead>
                    <TableHead>Question Type (Short Q/MCQ)</TableHead>
                    <TableHead>Question Text</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Correct Answer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.assessmentId}</TableCell>
                      <TableCell>{item.questionNumber}</TableCell>
                      <TableCell>{item.questionType}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.questionText}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.correctAnswer}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handleViewQuestion(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-submissions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Submission</CardTitle>
                <CardDescription>Your submitted work and answers</CardDescription>
              </div>
              <Button onClick={() => setAddSubmissionDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Submission
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Answer (Text)</TableHead>
                    <TableHead>Status (Submitted/Not Submitted)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.assessmentId}</TableCell>
                      <TableCell>{item.studentId}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.answer || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handleViewSubmission(item)}>
                          <Eye className="h-4 w-4" />
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

      {/* Assessment Detail Dialog */}
      <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
            <DialogDescription>Full summary of assessment {selectedAssessment?.assessmentId}</DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment ID</p>
                  <p className="font-medium">{selectedAssessment.assessmentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assessment Type</p>
                  <p className="font-medium">{selectedAssessment.assessmentType}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Assessment Title</p>
                  <p className="font-medium">{selectedAssessment.assessmentTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Obtained Mark</p>
                  <p className="font-medium">{selectedAssessment.obtainedMark} / {selectedAssessment.totalMarks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date & Time</p>
                  <p className="font-medium">{selectedAssessment.dueDateTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance Level</p>
                  <Badge className={getPerformanceColor(selectedAssessment.performanceLevel)}>
                    {selectedAssessment.performanceLevel}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedAssessment.status)}>
                    {selectedAssessment.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Feedback</p>
                  <p className="font-medium bg-muted p-3 rounded-md">{selectedAssessment.feedback}</p>
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
            <DialogDescription>Full summary of question from {selectedQuestion?.assessmentId}</DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment ID</p>
                  <p className="font-medium">{selectedQuestion.assessmentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Question Number</p>
                  <p className="font-medium">{selectedQuestion.questionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Question Type</p>
                  <Badge variant="outline">{selectedQuestion.questionType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedQuestion.category}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Question Text</p>
                  <p className="font-medium bg-muted p-3 rounded-md">{selectedQuestion.questionText}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Correct Answer</p>
                  <p className="font-medium bg-green-500/10 p-3 rounded-md border border-green-500/20">{selectedQuestion.correctAnswer}</p>
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
            <DialogDescription>Full summary of submission for {selectedSubmission?.assessmentId}</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment ID</p>
                  <p className="font-medium">{selectedSubmission.assessmentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{selectedSubmission.studentId}</p>
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
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="Enter Student ID (e.g., STU – 001)"
                value={newSubmission.studentId}
                onChange={(e) => setNewSubmission({ ...newSubmission, studentId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessmentId">Assessment ID</Label>
              <Input
                id="assessmentId"
                placeholder="Enter Assessment ID (e.g., ASM – 001)"
                value={newSubmission.assessmentId}
                onChange={(e) => setNewSubmission({ ...newSubmission, assessmentId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter your answer..."
                value={newSubmission.answer}
                onChange={(e) => setNewSubmission({ ...newSubmission, answer: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubmissionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmission}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
