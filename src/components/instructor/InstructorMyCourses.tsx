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
import { Plus, Pencil, Trash2, Search, Star, Eye } from "lucide-react";
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
  const [selectedPrereq, setSelectedPrereq] = useState<Prerequisite | null>(null);
  
  // Prerequisite CRUD states
  const [isPrereqDialogOpen, setIsPrereqDialogOpen] = useState(false);
  const [editingPrereq, setEditingPrereq] = useState<Prerequisite | null>(null);
  const [deletePrereqId, setDeletePrereqId] = useState<string | null>(null);
  const [prereqFormData, setPrereqFormData] = useState({
    course_id: "",
    prerequisite_course_id: "",
    prerequisite_text: "",
  });

  // Rating CRUD states
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [editingRating, setEditingRating] = useState<Rating | null>(null);
  const [deleteRatingId, setDeleteRatingId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [ratingFormData, setRatingFormData] = useState({
    course_id: "",
    student_id: "",
    rating_score: 5,
    content: "",
  });
  
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

  // Prerequisite CRUD handlers
  const handlePrereqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPrereq) {
      const { error } = await supabase
        .from("course_prerequisites")
        .update({
          course_id: prereqFormData.course_id,
          prerequisite_course_id: prereqFormData.prerequisite_course_id || null,
          prerequisite_text: prereqFormData.prerequisite_text || null,
        })
        .eq("id", editingPrereq.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update prerequisite", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Prerequisite updated" });
        fetchData();
        resetPrereqForm();
      }
    } else {
      const { error } = await supabase
        .from("course_prerequisites")
        .insert([{
          course_id: prereqFormData.course_id,
          prerequisite_course_id: prereqFormData.prerequisite_course_id || null,
          prerequisite_text: prereqFormData.prerequisite_text || null,
        }]);

      if (error) {
        toast({ title: "Error", description: "Failed to create prerequisite", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Prerequisite created" });
        fetchData();
        resetPrereqForm();
      }
    }
  };

  const handlePrereqDelete = async () => {
    if (!deletePrereqId) return;
    const { error } = await supabase.from("course_prerequisites").delete().eq("id", deletePrereqId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete prerequisite", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Prerequisite deleted" });
      fetchData();
    }
    setDeletePrereqId(null);
  };

  const handlePrereqEdit = (prereq: Prerequisite) => {
    setEditingPrereq(prereq);
    setPrereqFormData({
      course_id: prereq.course_id,
      prerequisite_course_id: prereq.prerequisite_course_id || "",
      prerequisite_text: prereq.prerequisite_text || "",
    });
    setIsPrereqDialogOpen(true);
  };

  const resetPrereqForm = () => {
    setPrereqFormData({ course_id: "", prerequisite_course_id: "", prerequisite_text: "" });
    setEditingPrereq(null);
    setIsPrereqDialogOpen(false);
  };

  // Rating CRUD handlers
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRating) {
      const { error } = await supabase
        .from("ratings_reviews")
        .update({
          course_id: ratingFormData.course_id,
          rating_score: ratingFormData.rating_score,
          content: ratingFormData.content || null,
        })
        .eq("id", editingRating.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update rating", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Rating updated" });
        fetchData();
        resetRatingForm();
      }
    } else {
      const { error } = await supabase
        .from("ratings_reviews")
        .insert([{
          course_id: ratingFormData.course_id,
          student_id: userId,
          rating_score: ratingFormData.rating_score,
          content: ratingFormData.content || null,
        }]);

      if (error) {
        toast({ title: "Error", description: "Failed to create rating", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Rating created" });
        fetchData();
        resetRatingForm();
      }
    }
  };

  const handleRatingDelete = async () => {
    if (!deleteRatingId) return;
    const { error } = await supabase.from("ratings_reviews").delete().eq("id", deleteRatingId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete rating", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Rating deleted" });
      fetchData();
    }
    setDeleteRatingId(null);
  };

  const handleRatingEdit = (rating: Rating) => {
    setEditingRating(rating);
    setRatingFormData({
      course_id: rating.course_id,
      student_id: rating.student_id,
      rating_score: rating.rating_score,
      content: rating.content || "",
    });
    setIsRatingDialogOpen(true);
  };

  const resetRatingForm = () => {
    setRatingFormData({ course_id: "", student_id: "", rating_score: 5, content: "" });
    setEditingRating(null);
    setIsRatingDialogOpen(false);
  };

  const formatCourseId = (courseId: string, index: number = 0) => {
    const courseFormats = ["CSC - 101", "CSC - 202", "CSC - 303", "CSC - 405", "CSC - 210", "CSC - 315", "CSC - 420"];
    const idx = courses.findIndex(c => c.id === courseId);
    return courseFormats[idx >= 0 ? idx % courseFormats.length : index % courseFormats.length];
  };

  const formatPrereqCourseId = (prereqCourseId: string | null, index: number = 0) => {
    if (!prereqCourseId) return "-";
    const prereqFormats = ["PRE - 001", "PRE - 002", "PRE - 003", "PRE - 004", "PRE - 005"];
    return prereqFormats[index % prereqFormats.length];
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || "-";
  };

  const formatRatingId = (ratingId: string, index: number = 0): string => {
    if (ratingId.includes("R -")) return ratingId;
    const num = String(index + 1).padStart(3, '0');
    return `R - ${num}`;
  };

  const formatStudentId = (studentId: string, index: number = 0): string => {
    if (studentId.includes("STU -")) return studentId;
    const num = String(index + 1).padStart(3, '0');
    return `STU - ${num}`;
  };

  const filteredCourses = courses.filter(
    (c) => {
      const searchLower = searchTerm.toLowerCase();
      const formattedId = formatCourseId(c.id).toLowerCase();
      return c.title.toLowerCase().includes(searchLower) ||
        c.category.toLowerCase().includes(searchLower) ||
        (c.difficulty_level || "").toLowerCase().includes(searchLower) ||
        (c.status || "").toLowerCase().includes(searchLower) ||
        formattedId.includes(searchLower);
    }
  );

  const filteredPrerequisites = prereqSearchTerm
    ? prerequisites.filter((p) => {
        const courseTitle = getCourseTitle(p.course_id).toLowerCase();
        return courseTitle.includes(prereqSearchTerm.toLowerCase()) || 
               p.course_id.toLowerCase().includes(prereqSearchTerm.toLowerCase());
      })
    : prerequisites;

  const filteredRatings = ratingsSearchTerm
    ? ratings.filter((r) => {
        const courseTitle = getCourseTitle(r.course_id).toLowerCase();
        const searchLower = ratingsSearchTerm.toLowerCase();
        return courseTitle.includes(searchLower) || 
               (r.content || "").toLowerCase().includes(searchLower) ||
               r.course_id.toLowerCase().includes(searchLower);
      })
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
                    <TableHead className="text-right">Details</TableHead>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Prerequisites</CardTitle>
                  <CardDescription>Manage prerequisites for your courses</CardDescription>
                </div>
                <Button onClick={() => { resetPrereqForm(); setIsPrereqDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prerequisite
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Course Title..."
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
                    <TableHead>Course Title</TableHead>
                    <TableHead>Prerequisite Course ID</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrerequisites.map((prereq, index) => (
                    <TableRow key={prereq.id}>
                      <TableCell className="font-medium">{formatCourseId(prereq.course_id)}</TableCell>
                      <TableCell>{getCourseTitle(prereq.course_id)}</TableCell>
                      <TableCell>{formatPrereqCourseId(prereq.prerequisite_course_id, index)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPrereq(prereq)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handlePrereqEdit(prereq)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletePrereqId(prereq.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPrerequisites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ratings & Reviews</CardTitle>
                  <CardDescription>Student feedback on your courses</CardDescription>
                </div>
                <Button onClick={() => { resetRatingForm(); setIsRatingDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rating
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Course Title..."
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
                    <TableHead>Review Text</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRatings.map((rating, index) => (
                    <TableRow key={rating.id}>
                      <TableCell className="font-mono text-xs">{formatRatingId(rating.id, index)}</TableCell>
                      <TableCell className="font-medium">{formatCourseId(rating.course_id, index)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatStudentId(rating.student_id, index)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < rating.rating_score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{rating.content || "-"}</TableCell>
                      <TableCell>{rating.created_at ? new Date(rating.created_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedRating(rating)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRatingEdit(rating)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteRatingId(rating.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRatings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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

      {/* Prerequisite Detail Modal */}
      <Dialog open={!!selectedPrereq} onOpenChange={() => setSelectedPrereq(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Prerequisite Details</DialogTitle>
          </DialogHeader>
          {selectedPrereq && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Course ID</Label>
                <p className="font-medium">{formatCourseId(selectedPrereq.course_id)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Course Title</Label>
                <p className="font-medium">{getCourseTitle(selectedPrereq.course_id)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Prerequisite Course ID</Label>
                <p className="font-medium">{formatPrereqCourseId(selectedPrereq.prerequisite_course_id)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Prerequisite Description</Label>
                <p className="font-medium">{selectedPrereq.prerequisite_text || "None"}</p>
              </div>
              {selectedPrereq.prerequisite_course_id && (
                <div>
                  <Label className="text-muted-foreground">Linked Course</Label>
                  <p className="font-medium">
                    {courses.find(c => c.id === selectedPrereq.prerequisite_course_id)?.title || formatCourseId(selectedPrereq.prerequisite_course_id)}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prerequisite CRUD Dialog */}
      <Dialog open={isPrereqDialogOpen} onOpenChange={setIsPrereqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPrereq ? "Edit Prerequisite" : "Add Prerequisite"}</DialogTitle>
            <DialogDescription>
              {editingPrereq ? "Update prerequisite details" : "Create a new prerequisite for a course"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePrereqSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select 
                value={prereqFormData.course_id} 
                onValueChange={(v) => setPrereqFormData({ ...prereqFormData, course_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prerequisite Course (Optional)</Label>
              <Select 
                value={prereqFormData.prerequisite_course_id} 
                onValueChange={(v) => setPrereqFormData({ ...prereqFormData, prerequisite_course_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select prerequisite course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {courses
                    .filter(c => c.id !== prereqFormData.course_id)
                    .map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prerequisite Description</Label>
              <Textarea
                value={prereqFormData.prerequisite_text}
                onChange={(e) => setPrereqFormData({ ...prereqFormData, prerequisite_text: e.target.value })}
                placeholder="e.g., Basic knowledge of programming required"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetPrereqForm}>Cancel</Button>
              <Button type="submit" disabled={!prereqFormData.course_id}>
                {editingPrereq ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletePrereqId}
        onOpenChange={() => setDeletePrereqId(null)}
        onConfirm={handlePrereqDelete}
        title="Delete Prerequisite"
        description="Are you sure you want to delete this prerequisite? This action cannot be undone."
      />

      {/* Rating Detail Modal */}
      <Dialog open={!!selectedRating} onOpenChange={() => setSelectedRating(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rating Details</DialogTitle>
          </DialogHeader>
          {selectedRating && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Rating ID</Label>
                <p className="font-medium">{formatRatingId(selectedRating.id)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Course</Label>
                <p className="font-medium">{getCourseTitle(selectedRating.course_id)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Student ID</Label>
                <p className="font-medium">{formatStudentId(selectedRating.student_id)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Rating Score</Label>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < selectedRating.rating_score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-2 font-medium">({selectedRating.rating_score}/5)</span>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Review Text</Label>
                <p className="font-medium">{selectedRating.content || "No review provided"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created At</Label>
                <p className="font-medium">
                  {selectedRating.created_at ? new Date(selectedRating.created_at).toLocaleString() : "-"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rating CRUD Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRating ? "Edit Rating" : "Add Rating"}</DialogTitle>
            <DialogDescription>
              {editingRating ? "Update rating details" : "Create a new rating for a course"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select 
                value={ratingFormData.course_id} 
                onValueChange={(v) => setRatingFormData({ ...ratingFormData, course_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rating Score</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Button
                    key={score}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRatingFormData({ ...ratingFormData, rating_score: score })}
                  >
                    <Star
                      className={`h-6 w-6 ${score <= ratingFormData.rating_score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </Button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">({ratingFormData.rating_score}/5)</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Review Text</Label>
              <Textarea
                value={ratingFormData.content}
                onChange={(e) => setRatingFormData({ ...ratingFormData, content: e.target.value })}
                placeholder="Write your review here..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetRatingForm}>Cancel</Button>
              <Button type="submit" disabled={!ratingFormData.course_id}>
                {editingRating ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteRatingId}
        onOpenChange={() => setDeleteRatingId(null)}
        onConfirm={handleRatingDelete}
        title="Delete Rating"
        description="Are you sure you want to delete this rating? This action cannot be undone."
      />
    </div>
  );
}
