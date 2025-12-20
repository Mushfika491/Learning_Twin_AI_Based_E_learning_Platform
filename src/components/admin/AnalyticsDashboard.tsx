import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, BookOpen, FileText } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalReports: number;
}

interface UserGrowthData {
  month: string;
  users: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface InstructorStats {
  name: string;
  courses: number;
  role: string;
}

const CATEGORY_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalReports: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [instructorStats, setInstructorStats] = useState<InstructorStats[]>([]);
  const [courseCompletionData, setCourseCompletionData] = useState<{ course: string; completion: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users from admin_users
      const { data: usersData, error: usersError } = await supabase
        .from("admin_users")
        .select("*");

      if (usersError) throw usersError;

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*");

      if (coursesError) throw coursesError;

      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("admin_reports")
        .select("*");

      if (reportsError) throw reportsError;

      // Fetch enrollments for completion data
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("*, courses(title)");

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => u.status === "active").length || 0;
      const totalCourses = coursesData?.length || 0;
      const totalReports = reportsData?.length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalCourses,
        totalReports,
      });

      // Process user growth data by month from admin_users created_at
      const monthlyUsers: { [key: string]: number } = {};
      usersData?.forEach(user => {
        const date = new Date(user.created_at);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyUsers[monthKey] = (monthlyUsers[monthKey] || 0) + 1;
      });

      // Create cumulative growth data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let cumulative = 0;
      const growthData = months.map(month => {
        cumulative += monthlyUsers[month] || 0;
        return { month, users: cumulative };
      }).filter(d => d.users > 0);

      setUserGrowthData(growthData.length > 0 ? growthData : [
        { month: "Current", users: totalUsers }
      ]);

      // Process category data from courses
      const categoryCounts: { [key: string]: number } = {};
      coursesData?.forEach(course => {
        const category = course.category || "Other";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const categoryChartData = Object.entries(categoryCounts).map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));

      setCategoryData(categoryChartData.length > 0 ? categoryChartData : [
        { name: "No Data", value: 1, color: CATEGORY_COLORS[0] }
      ]);

      // Process instructor stats from admin_users with role 'Instructor'
      const instructors = usersData?.filter(u => u.role === "Instructor") || [];
      const instructorData = instructors.map(instructor => ({
        name: instructor.name,
        courses: coursesData?.filter(c => c.instructor_id === instructor.user_id).length || 0,
        role: instructor.role,
      })).sort((a, b) => b.courses - a.courses).slice(0, 4);

      setInstructorStats(instructorData);

      // Process course completion data from reports
      const completionByReport = reportsData?.map(report => ({
        course: report.report_title.substring(0, 15) + (report.report_title.length > 15 ? "..." : ""),
        completion: report.completion_rate,
      })).slice(0, 5) || [];

      setCourseCompletionData(completionByReport.length > 0 ? completionByReport : [
        { course: "No Data", completion: 0 }
      ]);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">From admin_users table</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Status: Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Generated reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Cumulative user registration trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Completion Rates</CardTitle>
            <CardDescription>Completion rates from reports</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Categories</CardTitle>
            <CardDescription>Distribution of courses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructor Statistics</CardTitle>
            <CardDescription>Instructors by course count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {instructorStats.length > 0 ? (
                instructorStats.map((instructor) => (
                  <div key={instructor.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{instructor.name}</p>
                      <p className="text-sm text-muted-foreground">{instructor.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{instructor.courses}</p>
                      <p className="text-sm text-muted-foreground">courses</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No instructors found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
