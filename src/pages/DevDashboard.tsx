import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { RoleSidebar } from "@/components/RoleSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealthDashboard } from "@/components/dev/SystemHealthDashboard";
import { SystemLogsTable } from "@/components/dev/SystemLogsTable";

const DevDashboard = () => {
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

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData?.role !== 'dev_team') {
        navigate("/student/dashboard");
        return;
      }

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
        <RoleSidebar role="dev_team" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">Developer Dashboard</h1>
          
          <Tabs defaultValue="health" className="space-y-6">
            <TabsList>
              <TabsTrigger value="health">System Health</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="health">
              <SystemHealthDashboard />
            </TabsContent>

            <TabsContent value="logs">
              <SystemLogsTable />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default DevDashboard;
