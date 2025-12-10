import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { RoleSidebar } from "@/components/RoleSidebar";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Verify user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData?.role !== 'admin') {
        navigate("/student/dashboard");
        return;
      }

      // Fetch profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={profile ? { name: profile.name, email: profile.email, avatar: profile.avatar } : undefined} />
      <div className="flex w-full">
        <RoleSidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, courses, reports, and view system analytics</p>
          </div>
          
          <AnalyticsDashboard />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
