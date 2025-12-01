import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Home, BookOpen, BarChart2, FileText, Award, MessageCircle, FolderOpen, Settings } from "lucide-react";
import { DashboardHome } from "@/components/student/DashboardHome";
import { MyCourses } from "@/components/student/MyCourses";
import { MyProgress } from "@/components/student/MyProgress";
import { MyQuizzes } from "@/components/student/MyQuizzes";
import { Certificates } from "@/components/student/Certificates";
import { Discussions } from "@/components/student/Discussions";
import { Resources } from "@/components/student/Resources";
import { ProfileSettings } from "@/components/student/ProfileSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);
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

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "progress", label: "My Progress", icon: BarChart2 },
    { id: "quizzes", label: "My Quizzes", icon: FileText },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "discussions", label: "Discussions", icon: MessageCircle },
    { id: "resources", label: "Resources", icon: FolderOpen },
    { id: "profile", label: "Profile Settings", icon: Settings },
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
      <Navbar user={profile ? { name: profile.name, email: profile.email, avatar: profile.avatar } : undefined} />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.name || "Student"}!
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey and track your progress
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardHome userId={user?.id} />
          </TabsContent>

          <TabsContent value="courses">
            <MyCourses userId={user?.id} />
          </TabsContent>

          <TabsContent value="progress">
            <MyProgress userId={user?.id} />
          </TabsContent>

          <TabsContent value="quizzes">
            <MyQuizzes userId={user?.id} />
          </TabsContent>

          <TabsContent value="certificates">
            <Certificates userId={user?.id} />
          </TabsContent>

          <TabsContent value="discussions">
            <Discussions userId={user?.id} />
          </TabsContent>

          <TabsContent value="resources">
            <Resources userId={user?.id} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSettings userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
