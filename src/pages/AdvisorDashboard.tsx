import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { RoleSidebar } from "@/components/RoleSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtRiskStudentsTable } from "@/components/advisor/AtRiskStudentsTable";
import { InterventionLog } from "@/components/advisor/InterventionLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const engagementData = [
  { month: "Jan", engagement: 65, performance: 70 },
  { month: "Feb", engagement: 72, performance: 75 },
  { month: "Mar", engagement: 68, performance: 72 },
  { month: "Apr", engagement: 78, performance: 80 },
];

const AdvisorDashboard = () => {
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

      if (roleData?.role !== 'advisor') {
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
        <RoleSidebar role="advisor" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">Advisor Dashboard</h1>
          
          <Tabs defaultValue="at-risk" className="space-y-6">
            <TabsList>
              <TabsTrigger value="at-risk">At-Risk Students</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="at-risk">
              <AtRiskStudentsTable />
            </TabsContent>

            <TabsContent value="interventions">
              <InterventionLog />
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement vs Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="performance" stroke="hsl(var(--secondary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdvisorDashboard;
