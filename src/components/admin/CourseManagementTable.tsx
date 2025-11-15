import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { CourseFormDialog } from "./CourseFormDialog";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";

const mockCourses = [
  { id: "1", title: "Introduction to AI", category: "AI", instructor: "Dr. Smith", enrollments: 45, status: "active" },
  { id: "2", title: "Machine Learning Basics", category: "ML", instructor: "Prof. Johnson", enrollments: 67, status: "active" },
  { id: "3", title: "Deep Learning", category: "AI", instructor: "Dr. Williams", enrollments: 34, status: "active" },
  { id: "4", title: "Data Science 101", category: "Data", instructor: "Prof. Brown", enrollments: 89, status: "draft" },
];

export function CourseManagementTable() {
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deletingCourse, setDeletingCourse] = useState<any>(null);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = (courseData: any) => {
    setCourses([...courses, { ...courseData, id: Date.now().toString(), enrollments: 0 }]);
    setIsAddDialogOpen(false);
  };

  const handleEditCourse = (courseData: any) => {
    setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...courseData } : c));
    setEditingCourse(null);
  };

  const handleDeleteCourse = () => {
    setCourses(courses.filter(c => c.id !== deletingCourse.id));
    setDeletingCourse(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.category}</TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell>{course.enrollments}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCourse(course)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingCourse(course)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CourseFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddCourse}
        title="Add New Course"
      />

      <CourseFormDialog
        open={!!editingCourse}
        onOpenChange={(open) => !open && setEditingCourse(null)}
        onSubmit={handleEditCourse}
        initialData={editingCourse}
        title="Edit Course"
      />

      <DeleteConfirmDialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        description={`Are you sure you want to delete "${deletingCourse?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
