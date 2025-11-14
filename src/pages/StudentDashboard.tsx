import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, TrendingUp, Clock, Award, Brain, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  progress?: number;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress: number;
}

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      await fetchCourses(session.user.id);
      setIsLoading(false);
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCourses = async (userId: string) => {
    // Fetch enrolled courses
    const { data: enrollmentsData } = await supabase
      .from("enrollments")
      .select(`
        id,
        progress,
        course_id,
        courses (
          id,
          title,
          category,
          description
        )
      `)
      .eq("user_id", userId);

    if (enrollmentsData) {
      const coursesWithProgress = enrollmentsData.map((enrollment: any) => ({
        ...enrollment.courses,
        progress: enrollment.progress,
        enrollment_id: enrollment.id,
      }));
      setEnrolledCourses(coursesWithProgress);
    }

    // Fetch all available courses
    const { data: allCourses } = await supabase
      .from("courses")
      .select("*");

    if (allCourses) {
      const enrolledIds = enrollmentsData?.map((e: any) => e.course_id) || [];
      const available = allCourses.filter(c => !enrolledIds.includes(c.id));
      setAvailableCourses(available);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("enrollments")
      .insert([{ user_id: user.id, course_id: courseId, progress: 0 }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Enrolled successfully!",
      });
      await fetchCourses(user.id);
    }
  };

  const filteredAvailableCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Courses",
      value: enrolledCourses.length,
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      label: "Avg Progress",
      value: `${enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / enrolledCourses.length) : 0}%`,
      color: "text-green-500",
    },
    {
      icon: Clock,
      label: "Hours Learned",
      value: "24",
      color: "text-purple-500",
    },
    {
      icon: Award,
      label: "Certificates",
      value: "2",
      color: "text-amber-500",
    },
  ];

  const progressData = [
    { week: "Week 1", progress: 20 },
    { week: "Week 2", progress: 35 },
    { week: "Week 3", progress: 55 },
    { week: "Week 4", progress: 70 },
  ];

  const categoryData = [
    { name: "Programming", value: 40 },
    { name: "Design", value: 30 },
    { name: "Data Science", value: 20 },
    { name: "Business", value: 10 },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

  const recommendations = [
    {
      title: "Advanced JavaScript",
      category: "Programming",
      description: "Master modern JavaScript features and best practices",
    },
    {
      title: "Data Science Fundamentals",
      category: "Data Science",
      description: "Learn the basics of data analysis and visualization",
    },
    {
      title: "UX/UI Design Principles",
      category: "Design",
      description: "Create beautiful and user-friendly interfaces",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={profile} />
      
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.name || "Student"}!
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey and track your progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
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
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Analytics Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>My Progress</CardTitle>
                <CardDescription>Weekly learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="progress" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Distribution</CardTitle>
                <CardDescription>Time spent by category</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Continue where you left off</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrolledCourses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No enrolled courses yet. Browse available courses below!
                    </p>
                  ) : (
                    enrolledCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.category}
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress value={course.progress || 0} className="flex-1" />
                            <span className="text-sm font-medium">
                              {course.progress || 0}%
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Available Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Courses</CardTitle>
                  <CardDescription>Browse and enroll in new courses</CardDescription>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredAvailableCourses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No courses available
                    </p>
                  ) : (
                    filteredAvailableCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.category}
                          </p>
                          <p className="text-sm">{course.description}</p>
                        </div>
                        <Button
                          className="bg-gradient-primary"
                          onClick={() => handleEnroll(course.id)}
                        >
                          Enroll
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <CardTitle>AI Recommendations</CardTitle>
                  </div>
                  <CardDescription>Courses picked just for you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rec.category}
                      </p>
                      <p className="text-sm">{rec.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
