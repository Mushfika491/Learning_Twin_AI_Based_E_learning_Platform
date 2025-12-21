import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Users, TrendingUp, Star } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function InstructorDashboardHome() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgCompletion: 0,
    avgRating: 0,
  });
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch instructor's courses
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title")
      .eq("instructor_id", session.user.id);

    const courseIds = courses?.map(c => c.id) || [];

    // Get enrollment count and unique students
    let totalStudents = 0;
    let avgProgress = 0;
    if (courseIds.length > 0) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, progress, user_id")
        .in("course_id", courseIds);

      // Count unique students
      const uniqueStudents = new Set(enrollments?.map(e => e.user_id) || []);
      totalStudents = uniqueStudents.size;
      
      if (enrollments && enrollments.length > 0) {
        avgProgress = Math.round(
          enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length
        );
      }
    }

    // Get average rating
    let avgRating = 0;
    if (courseIds.length > 0) {
      const { data: ratings } = await supabase
        .from("ratings_reviews")
        .select("rating_score")
        .in("course_id", courseIds);

      if (ratings && ratings.length > 0) {
        avgRating = parseFloat(
          (ratings.reduce((acc, r) => acc + r.rating_score, 0) / ratings.length).toFixed(1)
        );
      }
    }

    setStats({
      totalCourses: courses?.length || 0,
      totalStudents,
      avgCompletion: avgProgress,
      avgRating,
    });

    // Fetch real engagement data from activity_logs (last 5 weeks)
    if (courseIds.length > 0) {
      const fiveWeeksAgo = new Date();
      fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
      
      const { data: activityLogs } = await supabase
        .from("activity_logs")
        .select("activity_time, user_id")
        .in("course_id", courseIds)
        .gte("activity_time", fiveWeeksAgo.toISOString());

      // Group by week
      const weeklyData: { [key: string]: Set<string> } = {};
      const now = new Date();
      
      for (let i = 4; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekLabel = `Week ${5 - i}`;
        weeklyData[weekLabel] = new Set();
        
        activityLogs?.forEach(log => {
          const logDate = new Date(log.activity_time || '');
          if (logDate >= weekStart && logDate < weekEnd) {
            weeklyData[weekLabel].add(log.user_id);
          }
        });
      }

      const engagementChartData = Object.entries(weeklyData).map(([name, students]) => ({
        name,
        students: students.size,
      }));
      
      setEngagementData(engagementChartData.length > 0 ? engagementChartData : [
        { name: "Week 1", students: 0 },
        { name: "Week 2", students: 0 },
        { name: "Week 3", students: 0 },
        { name: "Week 4", students: 0 },
        { name: "Week 5", students: 0 },
      ]);
    } else {
      setEngagementData([
        { name: "Week 1", students: 0 },
        { name: "Week 2", students: 0 },
        { name: "Week 3", students: 0 },
        { name: "Week 4", students: 0 },
        { name: "Week 5", students: 0 },
      ]);
    }

    // Fetch real performance data from scores/assessments
    if (courses && courses.length > 0) {
      const courseIdStrings = courses.map(c => c.id);
      
      // Fetch assessments for these courses
      const { data: assessments } = await supabase
        .from("student_assessments")
        .select("course_id, obtained_mark, total_marks")
        .in("course_id", courseIdStrings)
        .not("obtained_mark", "is", null);

      // Calculate average score per course
      const courseScores: { [courseId: string]: { total: number; count: number } } = {};
      
      assessments?.forEach(assessment => {
        if (assessment.course_id && assessment.obtained_mark !== null) {
          if (!courseScores[assessment.course_id]) {
            courseScores[assessment.course_id] = { total: 0, count: 0 };
          }
          const percentage = (assessment.obtained_mark / assessment.total_marks) * 100;
          courseScores[assessment.course_id].total += percentage;
          courseScores[assessment.course_id].count += 1;
        }
      });

      const perfData = courses.slice(0, 5).map(course => {
        const scores = courseScores[course.id];
        const avgScore = scores && scores.count > 0 
          ? Math.round(scores.total / scores.count) 
          : 0;
        return {
          course: course.title.length > 15 ? course.title.substring(0, 12) + "..." : course.title,
          avg: avgScore,
        };
      });
      
      setPerformanceData(perfData);
    } else {
      setPerformanceData([]);
    }
  };

  const statCards = [
    { icon: BookOpen, label: "Total Courses", value: stats.totalCourses, color: "text-blue-500" },
    { icon: Users, label: "Total Students", value: stats.totalStudents, color: "text-green-500" },
    { icon: TrendingUp, label: "Avg Completion", value: `${stats.avgCompletion}%`, color: "text-purple-500" },
    { icon: Star, label: "Avg Rating", value: stats.avgRating || "N/A", color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Home</h1>
        <p className="text-muted-foreground">Overview of your teaching performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <CardDescription>Active students per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Average scores by course</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
