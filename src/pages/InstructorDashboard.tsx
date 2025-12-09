import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { RoleSidebar } from "@/components/RoleSidebar";
import { supabase } from "@/integrations/supabase/client";
import { InstructorDashboardHome } from "@/components/instructor/InstructorDashboardHome";
import { InstructorMyCourses } from "@/components/instructor/InstructorMyCourses";
import { InstructorContentMaterials } from "@/components/instructor/InstructorContentMaterials";
import { InstructorStudentPerformance } from "@/components/instructor/InstructorStudentPerformance";
import { InstructorDiscussions } from "@/components/instructor/InstructorDiscussions";
import { InstructorProfileExpertise } from "@/components/instructor/InstructorProfileExpertise";

const InstructorDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "home";

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      if (profileData?.role !== 'instructor' && profileData?.role !== 'admin') {
        navigate("/student/dashboard");
        return;
      }

      setIsLoading(false);
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return <InstructorMyCourses />;
      case "content":
        return <InstructorContentMaterials />;
      case "students":
        return <InstructorStudentPerformance />;
      case "discussions":
        return <InstructorDiscussions />;
      case "profile":
        return <InstructorProfileExpertise />;
      default:
        return <InstructorDashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={profile} />
      <div className="flex w-full">
        <RoleSidebar role="instructor" />
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
