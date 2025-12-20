import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { RoleSidebar } from "@/components/RoleSidebar";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { SystemSettingsTable } from "@/components/admin/SystemSettingsTable";
import { ActivityLogsTable } from "@/components/admin/ActivityLogsTable";
import { AdminProfileTable } from "@/components/admin/AdminProfileTable";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

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

  const renderContent = () => {
    switch (currentTab) {
      case "users":
        return <UserManagementTable />;
      case "reports":
        return <ReportsTable />;
      case "settings":
        return <SystemSettingsTable />;
      case "logs":
        return <ActivityLogsTable />;
      case "profile":
        return <AdminProfileTable />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case "users":
        return { title: "User Management", description: "Manage all platform users" };
      case "reports":
        return { title: "Reports", description: "View and manage system reports" };
      case "settings":
        return { title: "System Settings", description: "Configure system settings" };
      case "logs":
        return { title: "Activity Logs", description: "View and manage system activity logs" };
      case "profile":
        return { title: "My Profile", description: "Manage your profile information" };
      default:
        return { title: "Admin Dashboard", description: "Manage users, courses, reports, and view system analytics" };
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { title, description } = getPageTitle();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={profile ? { name: profile.name, email: profile.email, avatar: profile.avatar } : undefined} />
      <div className="flex w-full">
        <RoleSidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
