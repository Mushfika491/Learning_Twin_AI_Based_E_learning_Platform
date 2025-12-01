import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Edit, Trash2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface Discussion {
  discussion_id: string;
  title: string;
  body: string;
  created_at: string;
  created_by_user_id: string;
  courses: {
    title: string;
  };
  profiles: {
    name: string;
  };
}

interface Course {
  id: string;
  title: string;
}

export function Discussions({ userId }: { userId: string }) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: "", body: "", course_id: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscussions();
    fetchEnrolledCourses();
  }, [userId]);

  const fetchDiscussions = async () => {
    const { data } = await supabase
      .from("discussions")
      .select(`
        *,
        courses(title)
      `)
      .order("created_at", { ascending: false });

    // Fetch creator names separately
    const discussionsWithNames = await Promise.all(
      (data || []).map(async (discussion) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", discussion.created_by_user_id)
          .single();
        
        return {
          ...discussion,
          profiles: { name: profile?.name || "Unknown" }
        };
      })
    );

    setDiscussions(discussionsWithNames);
  };

  const fetchEnrolledCourses = async () => {
    const { data } = await supabase
      .from("enrollments")
      .select("courses(id, title)")
      .eq("user_id", userId);

    const courses = data?.map(e => e.courses).filter(Boolean) || [];
    setEnrolledCourses(courses as Course[]);
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title || !newDiscussion.body || !newDiscussion.course_id) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("discussions").insert({
      title: newDiscussion.title,
      body: newDiscussion.body,
      course_id: newDiscussion.course_id,
      created_by_user_id: userId,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create discussion", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Discussion created!" });
      setIsAddDialogOpen(false);
      setNewDiscussion({ title: "", body: "", course_id: "" });
      fetchDiscussions();
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    const { error } = await supabase
      .from("discussions")
      .delete()
      .eq("discussion_id", discussionId)
      .eq("created_by_user_id", userId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete discussion", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Discussion deleted" });
      fetchDiscussions();
      setSelectedDiscussion(null);
    }
  };

  const filteredDiscussions = discussions.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Thread List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Discussions</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Discussion</DialogTitle>
                  <DialogDescription>Start a new discussion thread</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Course</Label>
                    <Select
                      value={newDiscussion.course_id}
                      onValueChange={(value) =>
                        setNewDiscussion({ ...newDiscussion, course_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {enrolledCourses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newDiscussion.title}
                      onChange={(e) =>
                        setNewDiscussion({ ...newDiscussion, title: e.target.value })
                      }
                      placeholder="Discussion title"
                    />
                  </div>
                  <div>
                    <Label>Body</Label>
                    <Textarea
                      value={newDiscussion.body}
                      onChange={(e) =>
                        setNewDiscussion({ ...newDiscussion, body: e.target.value })
                      }
                      placeholder="Start the discussion..."
                      rows={5}
                    />
                  </div>
                  <Button onClick={handleCreateDiscussion} className="w-full">
                    Create Discussion
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {filteredDiscussions.map(discussion => (
              <div
                key={discussion.discussion_id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedDiscussion?.discussion_id === discussion.discussion_id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedDiscussion(discussion)}
              >
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-1 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{discussion.title}</h4>
                    <p className="text-xs text-muted-foreground">{discussion.courses.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(discussion.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thread Detail */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Discussion Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDiscussion ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{selectedDiscussion.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Posted by {selectedDiscussion.profiles.name} in {selectedDiscussion.courses.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedDiscussion.created_at).toLocaleString()}
                </p>
              </div>

              <div className="prose prose-sm max-w-none">
                <p>{selectedDiscussion.body}</p>
              </div>

              {selectedDiscussion.created_by_user_id === userId && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDiscussion(selectedDiscussion.discussion_id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a discussion to view details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}