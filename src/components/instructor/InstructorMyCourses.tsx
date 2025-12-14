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
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty_level: string | null;
  status: string | null;
  created_at: string | null;
}

interface Prerequisite {
  id: string;
  course_id: string;
  prerequisite_text: string | null;
  prerequisite_course_id: string | null;
}

interface Rating {
  id: string;
  student_id: string;
  course_id: string;
  rating_score: number;
  content: string | null;
  created_at: string | null;
}

export function InstructorMyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [prereqSearchTerm, setPrereqSearchTerm] = useState("");
  const [ratingsSearchTerm, setRatingsSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty_level: "",
    status: "active",
  });

  // Mock data for demonstration
  const mockCourses: Course[] = [
    { id: "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6", title: "Introduction to Python", description: "Learn Python basics and fundamentals", category: "Programming", difficulty_level: "Beginner", status: "active", created_at: "2025-01-15T10:00:00Z" },
    { id: "c2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7", title: "Advanced JavaScript", description: "Deep dive into ES6+ features and patterns", category: "Programming", difficulty_level: "Advanced", status: "active", created_at: "2025-01-10T09:00:00Z" },
    { id: "c3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8", title: "Data Science Fundamentals", description: "Introduction to data analysis and visualization", category: "Data Science", difficulty_level: "Intermediate", status: "active", created_at: "2025-01-05T14:00:00Z" },
    { id: "c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9", title: "React Development", description: "Build modern web apps with React", category: "Programming", difficulty_level: "Intermediate", status: "draft", created_at: "2024-12-20T11:00:00Z" },
    { id: "c5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0", title: "Machine Learning Basics", description: "Introduction to ML algorithms and concepts", category: "Data Science", difficulty_level: "Advanced", status: "active", created_at: "2024-12-15T08:00:00Z" },
  ];

  const mockPrerequisites: Prerequisite[] = [
    { id: "p1", course_id: "c2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7", prerequisite_text: "Introduction to Python", prerequisite_course_id: "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6" },
    { id: "p2", course_id: "c3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8", prerequisite_text: "Basic Statistics Knowledge", prerequisite_course_id: null },
    { id: "p3", course_id: "c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9", prerequisite_text: "Advanced JavaScript", prerequisite_course_id: "c2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7" },
    { id: "p4", course_id: "c5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0", prerequisite_text: "Data Science Fundamentals", prerequisite_course_id: "c3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8" },
    { id: "p5", course_id: "c5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0", prerequisite_text: "Linear Algebra Basics", prerequisite_course_id: null },
  ];

  const mockRatings: Rating[] = [
    { id: "r1", student_id: "s1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6", course_id: "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6", rating_score: 5, content: "Excellent course! Very well explained.", created_at: "2025-01-18T15:30:00Z" },
    { id: "r2", student_id: "s2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7", course_id: "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6", rating_score: 4, content: "Good content, but could use more examples.", created_at: "2025-01-17T10:00:00Z" },
    { id: "r3", student_id: "s3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8", course_id: "c2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7", rating_score: 5, content: "Best JavaScript course I've taken!", created_at: "2025-01-16T14:20:00Z" },
    { id: "r4", student_id: "s4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9", course_id: "c3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8", rating_score: 4, content: "Great introduction to data science concepts.", created_at: "2025-01-15T09:45:00Z" },
    { id: "r5", student_id: "s5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0", course_id: "c5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0", rating_score: 5, content: "Challenging but rewarding course!", created_at: "2025-01-14T16:00:00Z" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);

    // Fetch courses
    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .eq("instructor_id", session.user.id)
      .order("created_at", { ascending: false });

    // Use fetched data or fallback to mock data
    if (coursesData && coursesData.length > 0) {
      setCourses(coursesData as Course[]);
      
      const courseIds = coursesData.map(c => c.id);
      const { data: prereqData } = await supabase
        .from("course_prerequisites")
        .select("*")
        .in("course_id", courseIds);
      setPrerequisites((prereqData as Prerequisite[]) || mockPrerequisites);

      const { data: ratingsData } = await supabase
        .from("ratings_reviews")
        .select("*")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });
      setRatings((ratingsData as Rating[]) || mockRatings);
    } else {
      // Use mock data when no real data exists
      setCourses(mockCourses);
      setPrerequisites(mockPrerequisites);
      setRatings(mockRatings);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCourse) {
      const { error } = await supabase
        .from("courses")
        .update(formData)
        .eq("id", editingCourse.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update course", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Course updated" });
        fetchData();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from("courses")
        .insert([{ ...formData, instructor_id: userId }]);

      if (error) {
        toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Course created" });
        fetchData();
        resetForm();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("courses").delete().eq("id", deleteId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Course deleted" });
      fetchData();
    }
    setDeleteId(null);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      category: course.category,
      difficulty_level: course.difficulty_level || "",
      status: course.status || "active",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "", difficulty_level: "", status: "active" });
    setEditingCourse(null);
    setIsDialogOpen(false);
  };

  const formatCourseId = (courseId: string) => {
    const courseFormats = ["CSC 101", "CSC 201", "CSC 303", "CSC 405", "CSC 210", "CSC 315", "CSC 420", "CSC 150", "CSC 250", "CSC 360"];
    const index = courses.findIndex(c => c.id === courseId);
    return courseFormats[index >= 0 ? index % courseFormats.length : 0];
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.difficulty_level || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrerequisites = prereqSearchTerm
    ? prerequisites.filter((p) => p.course_id.toLowerCase().includes(prereqSearchTerm.toLowerCase()))
    : prerequisites;

  const filteredRatings = ratingsSearchTerm
    ? ratings.filter((r) => r.course_id.toLowerCase().includes(ratingsSearchTerm.toLowerCase()))
    : ratings;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage your course catalog</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
          <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course List</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, category, difficulty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{formatCourseId(course.id)}</TableCell>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>{course.difficulty_level || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${course.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
                          {course.status || "active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(course.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCourses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No courses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prerequisites">
          <Card>
            <CardHeader>
              <CardTitle>Course Prerequisites</CardTitle>
              <CardDescription>View prerequisites for your courses</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Course ID..."
                  value={prereqSearchTerm}
                  onChange={(e) => setPrereqSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Prerequisites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrerequisites.map((prereq) => (
                    <TableRow key={prereq.id}>
                      <TableCell className="font-medium">{formatCourseId(prereq.course_id)}</TableCell>
                      <TableCell>{prereq.prerequisite_text || "None"}</TableCell>
                    </TableRow>
                  ))}
                  {filteredPrerequisites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                        No prerequisites found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Ratings & Reviews</CardTitle>
              <CardDescription>Student feedback on your courses</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Course ID..."
                  value={ratingsSearchTerm}
                  onChange={(e) => setRatingsSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rating ID</TableHead>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Rating Score</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRatings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell className="font-mono text-xs">{rating.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{formatCourseId(rating.course_id)}</TableCell>
                      <TableCell className="font-mono text-xs">{rating.student_id.slice(0, 8)}...</TableCell>
                      <TableCell>{rating.rating_score}</TableCell>
                      <TableCell className="max-w-xs truncate">{rating.content || "-"}</TableCell>
                      <TableCell>{rating.created_at ? new Date(rating.created_at).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {filteredRatings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No ratings yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update course details" : "Create a new course"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={formData.difficulty_level} onValueChange={(v) => setFormData({ ...formData, difficulty_level: v })}>
                <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit">{editingCourse ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
      />
    </div>
  );
}
