import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const mockStudents = [
  { id: "1", name: "John Doe", email: "john@example.com", riskLevel: "high", attendance: 45, performance: 52, engagement: 38 },
  { id: "2", name: "Sarah Wilson", email: "sarah@example.com", riskLevel: "medium", attendance: 68, performance: 65, engagement: 62 },
  { id: "3", name: "Mike Brown", email: "mike@example.com", riskLevel: "high", attendance: 42, performance: 48, engagement: 35 },
  { id: "4", name: "Emily Davis", email: "emily@example.com", riskLevel: "medium", attendance: 72, performance: 70, engagement: 68 },
];

export function AtRiskStudentsTable() {
  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingStudent, setViewingStudent] = useState<any>(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-800 border-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {student.riskLevel === "high" && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    {student.name}
                  </div>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRiskColor(student.riskLevel)}>
                    {student.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>{student.attendance}%</TableCell>
                <TableCell>{student.performance}%</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingStudent(student)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewingStudent} onOpenChange={(open) => !open && setViewingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Details: {viewingStudent?.name}</DialogTitle>
            <DialogDescription>{viewingStudent?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Risk Level</p>
                <Badge variant="outline" className={getRiskColor(viewingStudent?.riskLevel)}>
                  {viewingStudent?.riskLevel}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold">{viewingStudent?.attendance}%</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Performance Score</p>
                <p className="text-2xl font-bold">{viewingStudent?.performance}%</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Engagement Score</p>
                <p className="text-2xl font-bold">{viewingStudent?.engagement}%</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Recommended Actions</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Schedule one-on-one meeting</li>
                <li>Review course materials with student</li>
                <li>Connect with course instructor</li>
                <li>Provide additional resources</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
