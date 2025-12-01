import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, File, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Resource {
  resource_id: string;
  title: string;
  resource_type: string;
  storage_location: string;
  access_level: string;
  courses: {
    title: string;
  };
}

interface Content {
  id: string;
  title: string;
  type: string;
  link: string | null;
  courses: {
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
}

export function Resources({ userId }: { userId: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    fetchEnrolledCourses();
  }, [userId]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      fetchResources();
      fetchContents();
    }
  }, [enrolledCourses, selectedCourse]);

  const fetchEnrolledCourses = async () => {
    const { data } = await supabase
      .from("enrollments")
      .select("courses(id, title)")
      .eq("user_id", userId);

    const courses = data?.map(e => e.courses).filter(Boolean) || [];
    setEnrolledCourses(courses as Course[]);
  };

  const fetchResources = async () => {
    let query = supabase
      .from("resources")
      .select("*, courses(title)");

    if (selectedCourse !== "all") {
      query = query.eq("course_id", selectedCourse);
    }

    const { data } = await query;
    setResources(data || []);
  };

  const fetchContents = async () => {
    let query = supabase
      .from("content")
      .select("id, title, type, link, courses(title)");

    if (selectedCourse !== "all") {
      query = query.eq("course_id", selectedCourse);
    }

    const { data } = await query;
    setContents(data || []);
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContents = contents.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Resources</CardTitle>
          <CardDescription>Learning materials and resources from your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {enrolledCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map(resource => (
                <TableRow key={resource.resource_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-primary" />
                      {resource.title}
                    </div>
                  </TableCell>
                  <TableCell>{resource.courses.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{resource.resource_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{resource.access_level}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>Videos, documents, and learning materials</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContents.map(content => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>{content.courses.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{content.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {content.link || "—"}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
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