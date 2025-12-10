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
import { cn } from "@/lib/utils";

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
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

  const menuItems = [
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

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome userId={user?.id} />;
      case "courses":
        return <MyCourses userId={user?.id} />;
      case "progress":
        return <MyProgress userId={user?.id} />;
      case "quizzes":
        return <MyQuizzes userId={user?.id} />;
      case "certificates":
        return <Certificates userId={user?.id} />;
      case "discussions":
        return <Discussions userId={user?.id} />;
      case "resources":
        return <Resources userId={user?.id} />;
      case "profile":
        return <ProfileSettings userId={user?.id} />;
      default:
        return <DashboardHome userId={user?.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={profile ? { name: profile.name, email: profile.email, avatar: profile.avatar } : undefined} />
      
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] border-r bg-card">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Student Portal</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.name || "Student"}!
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey and track your progress
            </p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
