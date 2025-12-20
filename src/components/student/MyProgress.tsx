import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Eye, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PerformanceReport {
  performance_report_id: string;
  course_id: string;
  strengths: string;
  weakness: string;
  recommendations: string;
  generated_at: string;
}

export function MyProgress({ userId }: { userId: string }) {
  const [performanceData, setPerformanceData] = useState<PerformanceReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPerformanceReports = async () => {
    setLoading(true);
    try {
      // Fetch performance reports for the current user
      const { data, error } = await supabase
        .from("performance_reports")
        .select("performance_report_id, course_id, strengths, weakness, recommendations, generated_at")
        .order("generated_at", { ascending: false });

      if (error) {
        console.error("Error fetching performance reports:", error);
        toast({ title: "Error", description: "Failed to fetch performance reports", variant: "destructive" });
      } else {
        // Get the courses from student_courses to align with course titles
        const { data: coursesData } = await supabase
          .from("student_courses")
          .select("course_id");

        const courseIds = coursesData?.map(c => c.course_id.trim()) || [];
        
        // Filter reports to only show those matching courses in student_courses
        const filteredReports = (data || []).filter(report => 
          courseIds.includes(report.course_id.trim())
        );
        
        setPerformanceData(filteredReports);
      }
    } catch (err) {
      console.error("Error:", err);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchPerformanceReports();
    }
  }, [userId]);

  const filteredPerformance = performanceData.filter(p =>
    p.course_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Track your learning performance across courses</CardDescription>
            </div>
            <Button onClick={fetchPerformanceReports} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Course ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Performance Report</TableHead>
                <TableHead>Course ID</TableHead>
                <TableHead>Strengths</TableHead>
                <TableHead>Weakness</TableHead>
                <TableHead>Recommendations</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPerformance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No performance reports found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPerformance.map(item => (
                  <TableRow key={item.performance_report_id}>
                    <TableCell className="font-mono text-xs">
                      <Badge variant="secondary">{item.performance_report_id.trim()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.course_id.trim()}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={item.strengths}>
                      {item.strengths}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={item.weakness}>
                      {item.weakness}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={item.recommendations}>
                      {item.recommendations}
                    </TableCell>
                    <TableCell>{new Date(item.generated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Performance Report Summary</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Perf ID</p>
                                <p className="font-semibold">{item.performance_report_id.trim()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Course ID</p>
                                <p className="font-semibold">{item.course_id.trim()}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Strengths</p>
                              <p className="bg-muted/50 p-3 rounded-md mt-1">{item.strengths}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Weakness</p>
                              <p className="bg-muted/50 p-3 rounded-md mt-1">{item.weakness}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                              <p className="bg-muted/50 p-3 rounded-md mt-1">{item.recommendations}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Generated At</p>
                              <p className="font-semibold">{new Date(item.generated_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
