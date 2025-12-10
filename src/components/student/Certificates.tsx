import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Certificate {
  certificateId: string;
  studentId: string;
  courseId: string;
  courseName: string;
  issueDate: string;
  downloadableLink: string;
  status: "Completed" | "Processing" | "Revoked";
}

const mockCertificates: Certificate[] = [
  {
    certificateId: "CERT-001",
    studentId: "STU-2024-001",
    courseId: "CSE – 101",
    courseName: "Introduction to Computer Science",
    issueDate: "2024-01-15",
    downloadableLink: "https://certificates.learningtwin.com/cert-001.pdf",
    status: "Completed",
  },
  {
    certificateId: "CERT-002",
    studentId: "STU-2024-001",
    courseId: "CSE – 202",
    courseName: "Data Structures and Algorithms",
    issueDate: "2024-02-20",
    downloadableLink: "https://certificates.learningtwin.com/cert-002.pdf",
    status: "Completed",
  },
  {
    certificateId: "CERT-003",
    studentId: "STU-2024-001",
    courseId: "CSE – 305",
    courseName: "Database Management Systems",
    issueDate: "2024-03-10",
    downloadableLink: "https://certificates.learningtwin.com/cert-003.pdf",
    status: "Processing",
  },
  {
    certificateId: "CERT-004",
    studentId: "STU-2024-001",
    courseId: "CSE – 401",
    courseName: "Machine Learning Fundamentals",
    issueDate: "2024-04-05",
    downloadableLink: "https://certificates.learningtwin.com/cert-004.pdf",
    status: "Completed",
  },
  {
    certificateId: "CERT-005",
    studentId: "STU-2024-001",
    courseId: "CSE – 110",
    courseName: "Web Development Basics",
    issueDate: "2024-05-01",
    downloadableLink: "https://certificates.learningtwin.com/cert-005.pdf",
    status: "Revoked",
  },
];

export function Certificates({ userId }: { userId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates] = useState<Certificate[]>(mockCertificates);

  const filteredCertificates = certificates.filter(cert =>
    cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Revoked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Certificate Table</CardTitle>
          <CardDescription>Your earned course completion certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Certificate ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate ID</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Course ID</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Downloadable Link</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map(cert => (
                <TableRow key={cert.certificateId}>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {cert.certificateId}
                    </code>
                  </TableCell>
                  <TableCell>{cert.studentId}</TableCell>
                  <TableCell>{cert.courseId}</TableCell>
                  <TableCell className="font-medium">{cert.courseName}</TableCell>
                  <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild>
                      <a href={cert.downloadableLink} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(cert.status)}>
                      {cert.status}
                    </Badge>
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
