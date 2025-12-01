import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Search, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Quiz {
  quiz_id: string;
  title: string;
  total_marks: number;
  difficulty_level: string;
  created_at: string;
  courses: {
    title: string;
  };
}

interface Score {
  score_id: string;
  obtained_score: number;
  attempt_time: string;
  feedback_text: string;
  quizzes: {
    title: string;
    total_marks: number;
    courses: {
      title: string;
    };
  };
}

export function MyQuizzes({ userId }: { userId: string }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchQuizzes();
    fetchScores();
  }, [userId]);

  const fetchQuizzes = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select(`
        *,
        courses(title)
      `);

    setQuizzes(data || []);
  };

  const fetchScores = async () => {
    const { data } = await supabase
      .from("scores")
      .select(`
        *,
        quizzes(title, total_marks, courses(title))
      `)
      .eq("student_id", userId);

    setScores(data || []);
  };

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredScores = scores.filter(s =>
    s.quizzes.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Quizzes</CardTitle>
          <CardDescription>Quizzes from your enrolled courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map(quiz => (
                <TableRow key={quiz.quiz_id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.courses.title}</TableCell>
                  <TableCell>{quiz.total_marks}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{quiz.difficulty_level || "Medium"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Quiz Attempts</CardTitle>
          <CardDescription>Your past quiz scores and feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Attempt Date</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScores.map(score => (
                <TableRow key={score.score_id}>
                  <TableCell className="font-medium">{score.quizzes.title}</TableCell>
                  <TableCell>{score.quizzes.courses.title}</TableCell>
                  <TableCell>
                    <Badge>
                      {score.obtained_score}/{score.quizzes.total_marks}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(score.attempt_time).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{score.feedback_text || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}