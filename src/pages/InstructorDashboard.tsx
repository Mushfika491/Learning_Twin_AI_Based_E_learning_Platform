import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { RoleSidebar } from "@/components/RoleSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={profile} />
      <div className="flex w-full">
        <RoleSidebar role="instructor" />
        <div className="flex-1 p-8">
          <Tabs defaultValue="home" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="home">Dashboard Home</TabsTrigger>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="content">Content & Materials</TabsTrigger>
              <TabsTrigger value="students">Students & Performance</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="profile">Profile & Expertise</TabsTrigger>
            </TabsList>
            
            <TabsContent value="home">
              <InstructorDashboardHome />
            </TabsContent>
            
            <TabsContent value="courses">
              <InstructorMyCourses />
            </TabsContent>
            
            <TabsContent value="content">
              <InstructorContentMaterials />
            </TabsContent>
            
            <TabsContent value="students">
              <InstructorStudentPerformance />
            </TabsContent>
            
            <TabsContent value="discussions">
              <InstructorDiscussions />
            </TabsContent>
            
            <TabsContent value="profile">
              <InstructorProfileExpertise />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
