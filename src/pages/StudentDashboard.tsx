import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, TrendingUp, Clock, Award, Brain, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: string;
  title: string;
  category: string;
  progress: number;
}

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Fetch enrolled courses with progress
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select(`
          progress,
          courses (
            id,
            title,
            category
          )
        `)
        .eq("user_id", session.user.id);

      if (enrollmentsData) {
        const coursesWithProgress = enrollmentsData.map((enrollment: any) => ({
          id: enrollment.courses.id,
          title: enrollment.courses.title,
          category: enrollment.courses.category,
          progress: enrollment.progress,
        }));
        setCourses(coursesWithProgress);
      }

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

  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Courses",
      value: courses.length,
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      label: "Avg Progress",
      value: `${courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0}%`,
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Continue where you left off</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No enrolled courses yet. Start learning today!
                    </p>
                  ) : (
                    courses.map((course) => (
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
                            <Progress value={course.progress} className="flex-1" />
                            <span className="text-sm font-medium">
                              {course.progress}%
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
