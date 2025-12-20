import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  course_id: string;
  title: string;
  category: string;
  difficulty_level: string | null;
  status: string | null;
  instructor_id: string | null;
}

interface Enrollment {
  enrollment_id: string;
  course_id: string;
  title: string;
  learning_status: string;
  created_at: string;
}

interface EnrollmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: Enrollment | null;
  title: string;
  courses: Course[];
}

export function EnrollmentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  courses,
}: EnrollmentFormDialogProps) {
  const [formData, setFormData] = useState({
    enrollment_id: "",
    course_id: "",
    title: "",
    learning_status: "Not Started",
    created_at: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().slice(0, 5),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        enrollment_id: initialData.enrollment_id,
        course_id: initialData.course_id,
        title: initialData.title,
        learning_status: initialData.learning_status,
        created_at: initialData.created_at,
      });
    } else {
      setFormData({
        enrollment_id: "",
        course_id: "",
        title: "",
        learning_status: "Not Started",
        created_at: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().slice(0, 5),
      });
    }
  }, [initialData, open]);

  const handleCourseChange = (courseId: string) => {
    const selectedCourse = courses.find((c) => c.course_id === courseId);
    setFormData({
      ...formData,
      course_id: courseId,
      title: selectedCourse?.title || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={formData.course_id}
                onValueChange={handleCourseChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.course_id} value={course.course_id}>
                      {course.course_id} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Course title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Learning Status</Label>
              <Select
                value={formData.learning_status}
                onValueChange={(value) => setFormData({ ...formData, learning_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Enrollment" : "Add Enrollment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
