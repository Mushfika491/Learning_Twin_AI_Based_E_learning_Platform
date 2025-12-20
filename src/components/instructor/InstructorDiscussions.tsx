import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Search, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

interface Course {
  id: string;
  title: string;
}

interface Discussion {
  discussion_id: string;
  course_id: string;
  created_by_user_id: string;
  title: string;
  body: string;
  discussion_type: string | null;
  created_at: string | null;
}

interface Comment {
  id: string;
  discussion_id: string;
  user_id: string;
  comment_text: string;
  comment_time: string | null;
}

export function InstructorDiscussions() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState<string>("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    body: "",
    discussion_type: "announcement",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);

    // Get instructor's courses
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("instructor_id", session.user.id);

    if (coursesError) {
      toast({ title: "Error", description: "Failed to fetch courses", variant: "destructive" });
      return;
    }

    setCourses(coursesData || []);

    if (coursesData && coursesData.length > 0) {
      const courseIds = coursesData.map(c => c.id);
      
      // Fetch discussions for instructor's courses
      const { data: discussionsData, error: discussionsError } = await supabase
        .from("discussions")
        .select("*")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });

      if (discussionsError) {
        toast({ title: "Error", description: "Failed to fetch discussions", variant: "destructive" });
      } else {
        setDiscussions((discussionsData as Discussion[]) || []);
      }

      // Fetch comments for all discussions
      const discussionIds = (discussionsData || []).map(d => d.discussion_id);
      if (discussionIds.length > 0) {
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .in("discussion_id", discussionIds)
          .order("comment_time", { ascending: true });

        if (commentsError) {
          toast({ title: "Error", description: "Failed to fetch comments", variant: "destructive" });
        } else {
          setComments((commentsData as Comment[]) || []);
        }
      } else {
        setComments([]);
      }
    } else {
      setDiscussions([]);
      setComments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDiscussion) {
      const { error } = await supabase
        .from("discussions")
        .update({
          title: formData.title,
          body: formData.body,
          discussion_type: formData.discussion_type,
        })
        .eq("discussion_id", editingDiscussion.discussion_id);

      if (error) {
        toast({ title: "Error", description: "Failed to update discussion", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Discussion updated" });
        fetchData();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from("discussions")
        .insert([{
          ...formData,
          created_by_user_id: userId,
        }]);

      if (error) {
        toast({ title: "Error", description: "Failed to create discussion", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Discussion created" });
        fetchData();
        resetForm();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("discussions").delete().eq("discussion_id", deleteId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete discussion", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Discussion deleted" });
      if (selectedDiscussion?.discussion_id === deleteId) {
        setSelectedDiscussion(null);
      }
      fetchData();
    }
    setDeleteId(null);
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    const { error } = await supabase.from("comments").delete().eq("id", deleteCommentId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Comment deleted" });
      fetchData();
    }
    setDeleteCommentId(null);
  };

  const handleAddComment = async () => {
    if (!selectedDiscussion || !newComment.trim()) return;

    const { error } = await supabase.from("comments").insert([{
      discussion_id: selectedDiscussion.discussion_id,
      user_id: userId,
      comment_text: newComment,
    }]);

    if (error) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    } else {
      setNewComment("");
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({ course_id: "", title: "", body: "", discussion_type: "announcement" });
    setEditingDiscussion(null);
    setIsDialogOpen(false);
  };

  const filteredDiscussions = discussions.filter(d => {
    const course = courses.find(c => c.id === d.course_id);
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || d.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getCommentsForDiscussion = (discussionId: string) =>
    comments.filter(c => c.discussion_id === discussionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discussions</h1>
          <p className="text-muted-foreground">Manage course discussions and announcements</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Discussion List */}
        <Card>
          <CardHeader>
            <CardTitle>Discussion Threads</CardTitle>
            <CardDescription>Click on a discussion to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredDiscussions.map(discussion => {
                  const course = courses.find(c => c.id === discussion.course_id);
                  const commentCount = getCommentsForDiscussion(discussion.discussion_id).length;
                  return (
                    <div
                      key={discussion.discussion_id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedDiscussion?.discussion_id === discussion.discussion_id ? "bg-accent" : "hover:bg-accent/50"}`}
                      onClick={() => setSelectedDiscussion(discussion)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{discussion.title}</h4>
                          <p className="text-sm text-muted-foreground">{course?.title}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 bg-primary/10 rounded">{discussion.discussion_type || "general"}</span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {commentCount}
                            </span>
                          </div>
                        </div>
                        {discussion.created_by_user_id === userId && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={(e) => {
                              e.stopPropagation();
                              setEditingDiscussion(discussion);
                              setFormData({
                                course_id: discussion.course_id,
                                title: discussion.title,
                                body: discussion.body,
                                discussion_type: discussion.discussion_type || "announcement",
                              });
                              setIsDialogOpen(true);
                            }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(discussion.discussion_id);
                            }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredDiscussions.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No discussions found</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Discussion Detail */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedDiscussion ? selectedDiscussion.title : "Select a Discussion"}</CardTitle>
            {selectedDiscussion && (
              <CardDescription>
                {courses.find(c => c.id === selectedDiscussion.course_id)?.title}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedDiscussion ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p>{selectedDiscussion.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedDiscussion.created_at ? new Date(selectedDiscussion.created_at).toLocaleString() : ""}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Comments</h4>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-2">
                      {getCommentsForDiscussion(selectedDiscussion.discussion_id).map(comment => (
                        <div key={comment.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <p className="text-sm">{comment.comment_text}</p>
                            {comment.user_id === userId && (
                              <Button variant="ghost" size="icon" onClick={() => setDeleteCommentId(comment.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comment.comment_time ? new Date(comment.comment_time).toLocaleString() : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <Button onClick={handleAddComment}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Select a discussion to view its content and comments
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discussion Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDiscussion ? "Edit Discussion" : "New Discussion"}</DialogTitle>
            <DialogDescription>
              {editingDiscussion ? "Update discussion details" : "Create a new discussion thread"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={formData.course_id} onValueChange={(v) => setFormData({ ...formData, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.discussion_type} onValueChange={(v) => setFormData({ ...formData, discussion_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="qa">Q&A</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={4} required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit">{editingDiscussion ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Discussion"
        description="Are you sure you want to delete this discussion? All comments will also be deleted."
      />
      <DeleteConfirmDialog
        open={!!deleteCommentId}
        onOpenChange={() => setDeleteCommentId(null)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment?"
      />
    </div>
  );
}
