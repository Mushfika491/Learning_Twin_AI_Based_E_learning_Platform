import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Search, FileText, Video, Link as LinkIcon } from "lucide-react";
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

export function InstructorContentMaterials() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
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
      setContent(contentData || []);

      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });
      setQuizzes(quizzesData || []);
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      default: return <LinkIcon className="h-4 w-4" />;
    }
  };

  const filteredContent = content.filter(c => {
    const course = courses.find(cr => cr.id === c.course_id);
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || c.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredQuizzes = quizzes.filter(q => {
    const course = courses.find(cr => cr.id === q.course_id);
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || q.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content & Materials</h1>
          <p className="text-muted-foreground">Manage course content, quizzes, and assignments</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
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

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials">Lecture Materials</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => {
                    const course = courses.find(c => c.id === item.course_id);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="capitalize">{item.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{course?.title || "-"}</TableCell>
                        <TableCell>{item.order_index}</TableCell>
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
                    );
                  })}
                  {filteredContent.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No content found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quizzes & Assessments</CardTitle>
                <CardDescription>Manage course quizzes</CardDescription>
              </div>
              <Button onClick={() => { resetQuizForm(); setIsQuizDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Quiz
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.map((quiz) => {
                    const course = courses.find(c => c.id === quiz.course_id);
                    return (
                      <TableRow key={quiz.quiz_id}>
                        <TableCell className="font-medium">{quiz.title}</TableCell>
                        <TableCell>{course?.title || "-"}</TableCell>
                        <TableCell>{quiz.total_marks}</TableCell>
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
                    );
                  })}
                  {filteredQuizzes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No quizzes found
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
              <Label>Type</Label>
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
              <Label>Order Index</Label>
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
              <Label>Total Marks</Label>
              <Input type="number" value={quizForm.total_marks} onChange={(e) => setQuizForm({ ...quizForm, total_marks: parseInt(e.target.value) || 100 })} />
            </div>
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
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
    </div>
  );
}
