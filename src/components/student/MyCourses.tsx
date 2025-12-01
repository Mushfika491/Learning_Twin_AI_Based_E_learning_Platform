import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  status: string;
  courses: {
    title: string;
    category: string;
  };
}

interface Course {
  id: string;
  title: string;
  category: string;
  description: string | null;
  difficulty_level: string | null;
}

export function MyCourses({ userId }: { userId: string }) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
    fetchAvailableCourses();
  }, [userId]);

  const fetchEnrollments = async () => {
    const { data } = await supabase
      .from("enrollments")
      .select("*, courses(title, category)")
      .eq("user_id", userId);

    setEnrollments(data || []);
  };

  const fetchAvailableCourses = async () => {
    const { data: allCourses } = await supabase.from("courses").select("id, title, category, description");
    const { data: myEnrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("user_id", userId);

    const enrolledIds = myEnrollments?.map(e => e.course_id) || [];
    const available = (allCourses || []).filter(c => !enrolledIds.includes(c.id)).map(c => ({
      ...c,
      difficulty_level: null,
    }));
    setAvailableCourses(available);
  };

  const handleEnroll = async (courseId: string) => {
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, course_id: courseId, status: "enrolled" });

    if (error) {
      toast({ title: "Error", description: "Failed to enroll", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Enrolled successfully!" });
      fetchEnrollments();
      fetchAvailableCourses();
      setIsEnrollDialogOpen(false);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);

    if (error) {
      toast({ title: "Error", description: "Failed to unenroll", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Unenrolled successfully" });
      fetchEnrollments();
      fetchAvailableCourses();
    }
  };

  const filteredEnrollments = enrollments.filter(e =>
    e.courses.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.courses.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Enrollments</CardTitle>
              <CardDescription>Manage your enrolled courses</CardDescription>
            </div>
            <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Enroll in Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Available Courses</DialogTitle>
                  <DialogDescription>Choose a course to enroll in</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {availableCourses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.category}</p>
                        <p className="text-xs mt-1">{course.description}</p>
                      </div>
                      <Button onClick={() => handleEnroll(course.id)}>Enroll</Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map(enrollment => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{enrollment.courses.title}</TableCell>
                  <TableCell>{enrollment.courses.category}</TableCell>
                  <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={enrollment.status === "completed" ? "default" : "secondary"}>
                      {enrollment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnenroll(enrollment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}