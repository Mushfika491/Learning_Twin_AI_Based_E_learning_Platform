import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Save, Plus, X, User, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
}

interface InstructorProfile {
  id: string;
  user_id: string;
  degree: string | null;
  field_of_study: string | null;
  institution: string | null;
  graduation_year: number | null;
  certification: string | null;
  experience_years: number | null;
  bio: string | null;
}

interface Expertise {
  id: string;
  user_id: string;
  expertise: string;
}

export function InstructorProfileExpertise() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null);
  const [expertiseList, setExpertiseList] = useState<Expertise[]>([]);
  const [newExpertise, setNewExpertise] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const { toast } = useToast();

  const [personalForm, setPersonalForm] = useState({
    name: "",
    phone_number: "",
  });

  const [professionalForm, setProfessionalForm] = useState({
    degree: "",
    field_of_study: "",
    institution: "",
    graduation_year: "",
    certification: "",
    experience_years: "",
    bio: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, name, email, phone_number")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData as Profile);
      setPersonalForm({
        name: profileData.name || "",
        phone_number: profileData.phone_number || "",
      });
    }

    // Fetch instructor profile
    const { data: instructorData } = await supabase
      .from("instructor_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (instructorData) {
      setInstructorProfile(instructorData as InstructorProfile);
      setProfessionalForm({
        degree: instructorData.degree || "",
        field_of_study: instructorData.field_of_study || "",
        institution: instructorData.institution || "",
        graduation_year: instructorData.graduation_year?.toString() || "",
        certification: instructorData.certification || "",
        experience_years: instructorData.experience_years?.toString() || "",
        bio: instructorData.bio || "",
      });
    }

    // Fetch expertise
    const { data: expertiseData } = await supabase
      .from("instructor_expertise")
      .select("*")
      .eq("user_id", session.user.id);

    setExpertiseList((expertiseData as Expertise[]) || []);
  };

  const handleSavePersonal = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update(personalForm)
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: "Failed to save personal info", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Personal info saved" });
    }
    setIsLoading(false);
  };

  const handleSaveProfessional = async () => {
    setIsLoading(true);

    const data = {
      user_id: userId,
      degree: professionalForm.degree || null,
      field_of_study: professionalForm.field_of_study || null,
      institution: professionalForm.institution || null,
      graduation_year: professionalForm.graduation_year ? parseInt(professionalForm.graduation_year) : null,
      certification: professionalForm.certification || null,
      experience_years: professionalForm.experience_years ? parseInt(professionalForm.experience_years) : null,
      bio: professionalForm.bio || null,
    };

    if (instructorProfile) {
      const { error } = await supabase
        .from("instructor_profiles")
        .update(data)
        .eq("id", instructorProfile.id);

      if (error) {
        toast({ title: "Error", description: "Failed to save professional info", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Professional info saved" });
      }
    } else {
      const { error } = await supabase
        .from("instructor_profiles")
        .insert([data]);

      if (error) {
        toast({ title: "Error", description: "Failed to save professional info", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Professional info saved" });
        fetchData();
      }
    }
    setIsLoading(false);
  };

  const handleAddExpertise = async () => {
    if (!newExpertise.trim()) return;

    const { error } = await supabase
      .from("instructor_expertise")
      .insert([{ user_id: userId, expertise: newExpertise.trim() }]);

    if (error) {
      toast({ title: "Error", description: "Failed to add expertise", variant: "destructive" });
    } else {
      setNewExpertise("");
      fetchData();
    }
  };

  const handleRemoveExpertise = async (id: string) => {
    const { error } = await supabase
      .from("instructor_expertise")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to remove expertise", variant: "destructive" });
    } else {
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile & Expertise</h1>
        <p className="text-muted-foreground">Manage your personal and professional information</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={personalForm.name}
                onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={personalForm.phone_number}
                onChange={(e) => setPersonalForm({ ...personalForm, phone_number: e.target.value })}
              />
            </div>
            <Button onClick={handleSavePersonal} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>Your professional background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input
                  value={professionalForm.degree}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, degree: e.target.value })}
                  placeholder="e.g., Ph.D."
                />
              </div>
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input
                  value={professionalForm.field_of_study}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, field_of_study: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input
                  value={professionalForm.institution}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, institution: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Graduation Year</Label>
                <Input
                  type="number"
                  value={professionalForm.graduation_year}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, graduation_year: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certification</Label>
                <Input
                  value={professionalForm.certification}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, certification: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  value={professionalForm.experience_years}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, experience_years: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={professionalForm.bio}
                onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })}
                rows={3}
                placeholder="Tell students about yourself..."
              />
            </div>
            <Button onClick={handleSaveProfessional} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Expertise */}
      <Card>
        <CardHeader>
          <CardTitle>Expertise & Skills</CardTitle>
          <CardDescription>Add your areas of expertise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add expertise (e.g., Machine Learning)"
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddExpertise()}
            />
            <Button onClick={handleAddExpertise}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {expertiseList.map(exp => (
              <Badge key={exp.id} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                {exp.expertise}
                <button onClick={() => handleRemoveExpertise(exp.id)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {expertiseList.length === 0 && (
              <p className="text-sm text-muted-foreground">No expertise added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
