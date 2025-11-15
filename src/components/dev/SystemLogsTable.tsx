import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockLogs = [
  { id: "1", timestamp: "2024-01-15 14:23:45", level: "error", service: "api", message: "Database connection timeout", user: "system" },
  { id: "2", timestamp: "2024-01-15 14:22:10", level: "warning", service: "auth", message: "High login attempt rate detected", user: "john@example.com" },
  { id: "3", timestamp: "2024-01-15 14:20:33", level: "info", service: "api", message: "Course creation successful", user: "admin@example.com" },
  { id: "4", timestamp: "2024-01-15 14:18:22", level: "error", service: "storage", message: "File upload failed - size limit exceeded", user: "sarah@example.com" },
  { id: "5", timestamp: "2024-01-15 14:15:17", level: "info", service: "api", message: "User registration completed", user: "mike@example.com" },
  { id: "6", timestamp: "2024-01-15 14:12:08", level: "warning", service: "cache", message: "Cache miss rate above threshold", user: "system" },
];

export function SystemLogsTable() {
  const [logs] = useState(mockLogs);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "bg-red-100 text-red-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>Recent system activity and errors</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.service}</TableCell>
                  <TableCell className="max-w-md truncate">{log.message}</TableCell>
                  <TableCell className="text-muted-foreground">{log.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
