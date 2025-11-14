import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GraduationCap, Users, TrendingUp, Shield, Brain, Code } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const roles = [
    { value: "student", label: "Student", icon: GraduationCap },
    { value: "instructor", label: "Instructor", icon: Users },
    { value: "admin", label: "Admin", icon: Shield },
    { value: "advisor", label: "Advisor", icon: TrendingUp },
    { value: "data_scientist", label: "Data Scientist", icon: Brain },
    { value: "dev_team", label: "Dev Team", icon: Code },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch user's role to redirect to appropriate dashboard
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const roleRoutes: Record<string, string> = {
          student: "/student/dashboard",
          instructor: "/instructor/dashboard",
          admin: "/admin/dashboard",
          advisor: "/advisor/dashboard",
          data_scientist: "/data-scientist/dashboard",
          dev_team: "/dev/dashboard",
        };

        navigate(roleRoutes[roleData?.role] || "/student/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Fetch the session to get user ID
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Error",
        description: "Session not found after registration",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Fetch user's role from user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (roleError || !roleData) {
      toast({
        title: "Error",
        description: "Could not fetch user role. Please try logging in.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Account created successfully!",
    });

    // Route based on user's actual role
    const roleRoutes: Record<string, string> = {
      student: "/student/dashboard",
      instructor: "/instructor/dashboard",
      admin: "/admin/dashboard",
      advisor: "/advisor/dashboard",
      data_scientist: "/data-scientist/dashboard",
      dev_team: "/dev/dashboard",
    };

    navigate(roleRoutes[roleData.role]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="space-y-4">
            <Link to="/" className="flex items-center justify-center gap-2 font-bold text-xl">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Learning Twin
              </span>
            </Link>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Start your learning journey today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-3">
                <Label>Select Your Role</Label>
                <RadioGroup value={role} onValueChange={setRole}>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((roleOption) => {
                      const Icon = roleOption.icon;
                      return (
                        <label
                          key={roleOption.value}
                          className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                            role === roleOption.value
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background/50 hover:bg-accent"
                          }`}
                        >
                          <RadioGroupItem
                            value={roleOption.value}
                            id={roleOption.value}
                            className="sr-only"
                          />
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{roleOption.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit" 
                className="w-full bg-gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
