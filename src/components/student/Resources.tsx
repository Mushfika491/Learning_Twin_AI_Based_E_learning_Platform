import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function Resources({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("course-materials");
  const [contentSearch, setContentSearch] = useState("");
  const [materialsSearch, setMaterialsSearch] = useState("");
  const [filesSearch, setFilesSearch] = useState("");

  const filteredContent = mockContent.filter(item =>
    item.courseId.toLowerCase().includes(contentSearch.toLowerCase())
  );

  const filteredMaterials = mockCourseMaterials.filter(item =>
    item.courseId.toLowerCase().includes(materialsSearch.toLowerCase())
  );

  const filteredFiles = mockContentFiles.filter(item =>
    item.contentId.toLowerCase().includes(filesSearch.toLowerCase())
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

        <TabsContent value="my-assessments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Assessments</CardTitle>
              <CardDescription>Your quizzes and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Assessment content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-submissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>Your submitted work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Submissions content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
