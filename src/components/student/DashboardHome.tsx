import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Award, TrendingUp, GraduationCap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardStats {
  totalEnrolled: number;
  completedCourses: number;
  averageProgress: number;
  certificatesEarned: number;
}

export function DashboardHome({ userId }: { userId: string }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrolled: 0,
    completedCourses: 0,
    averageProgress: 0,
    certificatesEarned: 0,
  });
  const [activityData, setActivityData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      // Fetch enrollments
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("*, courses(title)")
        .eq("user_id", userId);

      // Fetch certificates
      const { data: certificates } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", userId);

      // Fetch progress
      const { data: progress } = await supabase
        .from("progress")
        .select("*, courses(title)")
        .eq("student_id", userId);

      // Fetch activity logs
      const { data: activities } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("activity_time", { ascending: true })
        .limit(30);

      const totalEnrolled = enrollments?.length || 0;
      const completedCourses = enrollments?.filter(e => e.status === "completed").length || 0;
      const avgProgress = progress?.length
        ? progress.reduce((sum, p) => sum + (p.percentage_completed || 0), 0) / progress.length
        : 0;

      setStats({
        totalEnrolled,
        completedCourses,
        averageProgress: Math.round(avgProgress),
        certificatesEarned: certificates?.length || 0,
      });

      // Process activity data for chart (group by week)
      const activityByWeek = processActivityData(activities || []);
      setActivityData(activityByWeek);

      // Process progress data for bar chart
      const progressByWeek = (progress || []).slice(0, 10).map((p: any) => ({
        course: p.courses?.title?.substring(0, 20) || "Course",
        progress: p.percentage_completed || 0,
      }));
      setProgressData(progressByWeek);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processActivityData = (activities: any[]) => {
    const weeklyData: { [key: string]: number } = {};
    activities.forEach(activity => {
      const date = new Date(activity.activity_time);
      const weekKey = `Week ${Math.floor((date.getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)) + 4}`;
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    return Object.entries(weeklyData).map(([week, count]) => ({ week, count })).slice(-4);
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                <p className="text-2xl font-bold mt-1">{stats.totalEnrolled}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats.completedCourses}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold mt-1">{stats.averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold mt-1">{stats.certificatesEarned}</p>
              </div>
              <Award className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
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
    </div>
  );
}