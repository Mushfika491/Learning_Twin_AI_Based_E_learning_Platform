import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Eye, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PerformanceReport {
  courseId: string;
  perfReportId: string;
  strengths: string;
  weakness: string;
  recommendations: string;
  generatedAt: string;
}

// Mock data for Performance table
const mockPerformance: PerformanceReport[] = [
  {
    courseId: "CSE – 101",
    perfReportId: "PERF – 001",
    strengths: "Strong problem-solving skills, excellent code structure",
    weakness: "Time management during assignments",
    recommendations: "Practice timed coding exercises",
    generatedAt: "2024-01-15",
  },
  {
    courseId: "CSE – 102",
    perfReportId: "PERF – 002",
    strengths: "Good understanding of data structures",
    weakness: "Algorithm optimization techniques",
    recommendations: "Focus on Big-O notation and optimization",
    generatedAt: "2024-02-20",
  },
  {
    courseId: "CSE – 103",
    perfReportId: "PERF – 003",
    strengths: "Creative UI designs, attention to detail",
    weakness: "Responsive design implementation",
    recommendations: "Study CSS flexbox and grid layouts",
    generatedAt: "2024-03-10",
  },
  {
    courseId: "CSE – 104",
    perfReportId: "PERF – 004",
    strengths: "Database normalization knowledge",
    weakness: "Complex query optimization",
    recommendations: "Practice advanced SQL queries",
    generatedAt: "2024-03-25",
  },
  {
    courseId: "CSE – 105",
    perfReportId: "PERF – 005",
    strengths: "Understanding of ML concepts",
    weakness: "Model tuning and hyperparameters",
    recommendations: "Experiment with different model configurations",
    generatedAt: "2024-04-01",
  },
];

export function MyProgress({ userId }: { userId: string }) {
  const [performanceData, setPerformanceData] = useState<PerformanceReport[]>(mockPerformance);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewingReport, setViewingReport] = useState<PerformanceReport | null>(null);

  const fetchProgress = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const filteredPerformance = performanceData.filter(p =>
    p.courseId.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Button onClick={fetchProgress} disabled={loading}>
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
                <TableHead>Course ID</TableHead>
                <TableHead>Perf Report ID</TableHead>
                <TableHead>Strengths</TableHead>
                <TableHead>Weakness</TableHead>
                <TableHead>Recommendations</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPerformance.map(item => (
                <TableRow key={item.perfReportId}>
                  <TableCell>
                    <Badge variant="outline">{item.courseId}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.perfReportId}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={item.strengths}>
                    {item.strengths}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={item.weakness}>
                    {item.weakness}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={item.recommendations}>
                    {item.recommendations}
                  </TableCell>
                  <TableCell>{new Date(item.generatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setViewingReport(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Performance Report Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Course ID</p>
                            <p className="font-semibold">{item.courseId}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Perf Report ID</p>
                            <p className="font-semibold">{item.perfReportId}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Strengths</p>
                            <p>{item.strengths}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Weakness</p>
                            <p>{item.weakness}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                            <p>{item.recommendations}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Generated At</p>
                            <p>{new Date(item.generatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
