import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Certificate {
  certificate_id: string;
  issue_date: string;
  certificate_code: string;
  courses: {
    title: string;
    category: string;
  };
}

export function Certificates({ userId }: { userId: string }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    const { data } = await supabase
      .from("certificates")
      .select("*, courses(title, category)")
      .eq("student_id", userId);

    setCertificates(data || []);
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Certificates</CardTitle>
          <CardDescription>Your earned course completion certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No certificates earned yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete courses to earn certificates!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Certificate Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map(cert => (
                  <TableRow key={cert.certificate_id}>
                    <TableCell className="font-medium">{cert.courses.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{cert.courses.category}</Badge>
                    </TableCell>
                    <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {cert.certificate_code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}