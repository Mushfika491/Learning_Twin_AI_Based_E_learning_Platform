import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  learning_goals: string;
  interests: string;
  achievements: string;
  profile_summary: string;
}

export function ProfileSettings({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    role: "",
    learning_goals: "",
    interests: "",
    achievements: "",
    profile_summary: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "",
        learning_goals: data.learning_goals || "",
        interests: data.interests || "",
        achievements: data.achievements || "",
        profile_summary: data.profile_summary || "",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        learning_goals: profile.learning_goals,
        interests: profile.interests,
        achievements: profile.achievements,
        profile_summary: profile.profile_summary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    }

    setLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={profile.email} disabled className="bg-muted" />
          </div>

          <div>
            <Label>Role</Label>
            <Input value={profile.role} disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Profile</CardTitle>
          <CardDescription>Customize your learning preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Learning Goals</Label>
            <Textarea
              value={profile.learning_goals}
              onChange={(e) => setProfile({ ...profile, learning_goals: e.target.value })}
              placeholder="What do you want to achieve?"
              rows={3}
            />
          </div>

          <div>
            <Label>Interests</Label>
            <Input
              value={profile.interests}
              onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
              placeholder="Your areas of interest (comma-separated)"
            />
          </div>

          <div>
            <Label>Achievements</Label>
            <Textarea
              value={profile.achievements}
              onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
              placeholder="Your accomplishments and milestones"
              rows={3}
            />
          </div>

          <div>
            <Label>Profile Summary</Label>
            <Textarea
              value={profile.profile_summary}
              onChange={(e) => setProfile({ ...profile, profile_summary: e.target.value })}
              placeholder="Brief summary about yourself"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}