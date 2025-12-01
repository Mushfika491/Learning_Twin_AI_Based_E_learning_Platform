import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Search, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressItem {
  progress_id: string;
  percentage_completed: number;
  time_spent_minutes: number;
  last_accessed: string;
  courses: {
    title: string;
  };
}

export function MyProgress({ userId }: { userId: string }) {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("progress")
      .select("*, courses(title)")
      .eq("student_id", userId);

    setProgressItems(data || []);
    setLoading(false);
  };

  const filteredProgress = progressItems.filter(p =>
    p.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = filteredProgress.slice(0, 10).map(p => ({
    course: p.courses.title.substring(0, 20),
    progress: p.percentage_completed,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Progress</CardTitle>
              <CardDescription>Track your learning progress across courses</CardDescription>
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
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Time Spent</TableHead>
                <TableHead>Last Accessed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProgress.map(item => (
                <TableRow key={item.progress_id}>
                  <TableCell className="font-medium">{item.courses.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={item.percentage_completed} className="flex-1" />
                      <span className="text-sm font-medium">{item.percentage_completed}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{Math.floor(item.time_spent_minutes / 60)}h {item.time_spent_minutes % 60}m</TableCell>
                  <TableCell>{new Date(item.last_accessed).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}