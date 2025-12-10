import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Award, TrendingUp, GraduationCap, Bell, FileUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

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
  const [newContent, setNewContent] = useState<any[]>([]);
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

      // Fetch new content for enrolled courses (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];
      
      if (enrolledCourseIds.length > 0) {
        const { data: recentContent } = await supabase
          .from("content")
          .select("*, courses(title)")
          .in("course_id", enrolledCourseIds)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(5);
        
        setNewContent(recentContent || []);
      }

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

      {/* New Content Uploaded Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>New Content Uploaded</CardTitle>
          </div>
          <CardDescription>Recent materials added to your enrolled courses</CardDescription>
        </CardHeader>
        <CardContent>
          {newContent.length === 0 ? (
            <p className="text-muted-foreground text-sm">No new content in the last 7 days.</p>
          ) : (
            <div className="space-y-3">
              {newContent.map((content: any) => (
                <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{content.title}</p>
                      <p className="text-xs text-muted-foreground">{content.courses?.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{content.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(content.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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