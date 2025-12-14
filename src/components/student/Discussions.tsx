import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Trash2, MessageCircle, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface Comment {
  id: string;
  comment_text: string;
  comment_time: string;
  user_id: string;
  user_name?: string;
}

interface Course {
  id: string;
  title: string;
}

// Mock data for discussions
const mockDiscussions: Discussion[] = [
  {
    discussion_id: "DIS – 001",
    title: "How to implement recursion in Python?",
    body: "I'm having trouble understanding recursion concepts. Can someone explain with a simple example? I've tried the factorial function but I'm getting confused about the base case and how the stack works.",
    created_at: "2024-03-15T10:30:00Z",
    created_by_user_id: "user-001",
    courses: { title: "Introduction to Python" },
    profiles: { name: "John Smith" }
  },
  {
    discussion_id: "DIS – 002",
    title: "Best practices for data visualization",
    body: "What are the recommended libraries and techniques for creating effective data visualizations? I'm working on a project that requires presenting complex datasets in an understandable way.",
    created_at: "2024-03-18T14:15:00Z",
    created_by_user_id: "user-002",
    courses: { title: "Data Science Fundamentals" },
    profiles: { name: "Emily Johnson" }
  }
];

// Mock comments for demo
const mockComments: Comment[] = [
  { id: "1", comment_text: "Great question! The base case is crucial - it's what stops the recursion.", comment_time: "2024-03-15T11:00:00Z", user_id: "user-003", user_name: "Prof. Williams" },
  { id: "2", comment_text: "I had the same confusion. Try visualizing it with a call stack diagram!", comment_time: "2024-03-15T12:30:00Z", user_id: "user-004", user_name: "Sarah Lee" },
  { id: "3", comment_text: "Here's a tip: always define your base case first, then the recursive step.", comment_time: "2024-03-15T14:00:00Z", user_id: "user-001", user_name: "John Smith" },
];

export function Discussions({ userId }: { userId: string }) {
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: "", body: "", course_id: "" });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUserName, setCurrentUserName] = useState("You");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscussions();
    fetchEnrolledCourses();
    fetchCurrentUserName();
  }, [userId]);

  useEffect(() => {
    if (selectedDiscussion) {
      fetchComments(selectedDiscussion.discussion_id);
    }
  }, [selectedDiscussion]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCurrentUserName = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      setCurrentUserName(data.name);
    }
  };

  const fetchDiscussions = async () => {
    const { data } = await supabase
      .from("discussions")
      .select(`
        *,
        courses(title)
      `)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) {
      return;
    }

    const discussionsWithNames = await Promise.all(
      data.map(async (discussion) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", discussion.created_by_user_id)
          .maybeSingle();
        
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

  const fetchComments = async (discussionId: string) => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("discussion_id", discussionId)
      .order("comment_time", { ascending: true });

    if (!data || data.length === 0) {
      // Use mock comments for demo if the discussion is a mock one
      if (discussionId.startsWith("DIS")) {
        setComments(mockComments);
      } else {
        setComments([]);
      }
      return;
    }

    // Fetch user names for comments
    const commentsWithNames = await Promise.all(
      data.map(async (comment) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", comment.user_id)
          .maybeSingle();
        
        return {
          ...comment,
          user_name: profile?.name || "Unknown"
        };
      })
    );

    setComments(commentsWithNames);
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
      setComments([]);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedDiscussion) return;

    // For mock discussions, just add locally
    if (selectedDiscussion.discussion_id.startsWith("DIS")) {
      const mockComment: Comment = {
        id: Date.now().toString(),
        comment_text: newComment,
        comment_time: new Date().toISOString(),
        user_id: userId,
        user_name: currentUserName
      };
      setComments(prev => [...prev, mockComment]);
      setNewComment("");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      discussion_id: selectedDiscussion.discussion_id,
      user_id: userId,
      comment_text: newComment,
      comment_time: new Date().toISOString()
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send comment", variant: "destructive" });
    } else {
      setNewComment("");
      fetchComments(selectedDiscussion.discussion_id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const filteredDiscussions = discussions.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Thread List */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
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
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4 flex-shrink-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-2">
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
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedDiscussion ? (
          <>
            {/* Header */}
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedDiscussion.title}</CardTitle>
                  <CardDescription>
                    {selectedDiscussion.courses.title} • Started by {selectedDiscussion.profiles.name}
                  </CardDescription>
                </div>
                {selectedDiscussion.created_by_user_id === userId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDiscussion(selectedDiscussion.discussion_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                {/* Original Post */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(selectedDiscussion.profiles.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{selectedDiscussion.profiles.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedDiscussion.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{selectedDiscussion.body}</p>
                </div>

                {/* Comments */}
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const isOwn = comment.user_id === userId;
                    return (
                      <div
                        key={comment.id}
                        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={`text-xs ${isOwn ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                            {getInitials(comment.user_name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                          <div
                            className={`p-3 rounded-2xl ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            }`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {comment.user_name}
                              </p>
                            )}
                            <p className="text-sm">{comment.comment_text}</p>
                          </div>
                          <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? "text-right" : ""}`}>
                            {new Date(comment.comment_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a discussion to view messages</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}