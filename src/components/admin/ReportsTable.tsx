import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Trash2, Pencil, Plus, Search } from "lucide-react";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  reportId: string;
  title: string;
  type: string;
  coursePopularity: string;
  userEngagement: string;
  completionRate: string;
  timePeriod: string;
  generatedAt: string;
  status: "Completed" | "Failed" | "Scheduled";
}

const mockReports: Report[] = [
  { 
    id: "1", 
    reportId: "RPT-001", 
    title: "Monthly User Activity", 
    type: "Activity", 
    coursePopularity: "High",
    userEngagement: "85%",
    completionRate: "72%",
    timePeriod: "January 2025",
    generatedAt: "2025-02-01 09:00:00", 
    status: "Completed" 
  },
  { 
    id: "2", 
    reportId: "RPT-002", 
    title: "Course Completion Analysis", 
    type: "Performance", 
    coursePopularity: "Medium",
    userEngagement: "78%",
    completionRate: "65%",
    timePeriod: "Q4 2024",
    generatedAt: "2025-01-15 14:30:00", 
    status: "Completed" 
  },
  { 
    id: "3", 
    reportId: "RPT-003", 
    title: "Revenue Report Q4 2024", 
    type: "Financial", 
    coursePopularity: "High",
    userEngagement: "92%",
    completionRate: "88%",
    timePeriod: "Q4 2024",
    generatedAt: "2025-01-10 11:00:00", 
    status: "Completed" 
  },
  { 
    id: "4", 
    reportId: "RPT-004", 
    title: "System Health Check", 
    type: "System", 
    coursePopularity: "Low",
    userEngagement: "45%",
    completionRate: "50%",
    timePeriod: "Weekly",
    generatedAt: "2025-02-05 08:00:00", 
    status: "Scheduled" 
  },
  { 
    id: "5", 
    reportId: "RPT-005", 
    title: "User Engagement Metrics", 
    type: "Analytics", 
    coursePopularity: "High",
    userEngagement: "N/A",
    completionRate: "N/A",
    timePeriod: "February 2025",
    generatedAt: "2025-02-03 16:45:00", 
    status: "Failed" 
  },
];

export function ReportsTable() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [deletingReport, setDeletingReport] = useState<Report | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Report>>({
    reportId: "",
    title: "",
    type: "",
    coursePopularity: "",
    userEngagement: "",
    completionRate: "",
    timePeriod: "",
    generatedAt: "",
    status: "Scheduled",
  });

  const filteredReports = reports.filter(report =>
    report.reportId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteReport = () => {
    if (deletingReport) {
      setReports(reports.filter(r => r.id !== deletingReport.id));
      setDeletingReport(null);
    }
  };

  const handleAddReport = () => {
    const newReport: Report = {
      id: String(reports.length + 1),
      reportId: formData.reportId || `RPT-${String(reports.length + 1).padStart(3, '0')}`,
      title: formData.title || "",
      type: formData.type || "",
      coursePopularity: formData.coursePopularity || "",
      userEngagement: formData.userEngagement || "",
      completionRate: formData.completionRate || "",
      timePeriod: formData.timePeriod || "",
      generatedAt: formData.generatedAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: formData.status as "Completed" | "Failed" | "Scheduled" || "Scheduled",
    };
    setReports([...reports, newReport]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditReport = () => {
    if (editingReport) {
      setReports(reports.map(r => 
        r.id === editingReport.id 
          ? { ...r, ...formData } as Report
          : r
      ));
      setEditingReport(null);
      resetForm();
    }
  };

  const openEditDialog = (report: Report) => {
    setFormData({
      reportId: report.reportId,
      title: report.title,
      type: report.type,
      coursePopularity: report.coursePopularity,
      userEngagement: report.userEngagement,
      completionRate: report.completionRate,
      timePeriod: report.timePeriod,
      generatedAt: report.generatedAt,
      status: report.status,
    });
    setEditingReport(report);
  };

  const resetForm = () => {
    setFormData({
      reportId: "",
      title: "",
      type: "",
      coursePopularity: "",
      userEngagement: "",
      completionRate: "",
      timePeriod: "",
      generatedAt: "",
      status: "Scheduled",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Report ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Report
        </Button>
      </div>

      <div className="border rounded-lg">
        <h3 className="text-lg font-semibold p-4 border-b">Reports</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report ID</TableHead>
              <TableHead>Report Title</TableHead>
              <TableHead>Report Type</TableHead>
              <TableHead>Course Popularity</TableHead>
              <TableHead>User Engagement</TableHead>
              <TableHead>Completion Rate</TableHead>
              <TableHead>Time Period</TableHead>
              <TableHead>Generated At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.reportId}</TableCell>
                <TableCell>{report.title}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{report.coursePopularity}</TableCell>
                <TableCell>{report.userEngagement}</TableCell>
                <TableCell>{report.completionRate}</TableCell>
                <TableCell>{report.timePeriod}</TableCell>
                <TableCell>{report.generatedAt}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(report.status)}`}>
                    {report.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingReport(report)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(report)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingReport(report)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Report Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewingReport?.title}</DialogTitle>
            <DialogDescription>
              {viewingReport?.type} Report • {viewingReport?.reportId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Report ID</p>
                <p className="font-medium">{viewingReport?.reportId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Report Type</p>
                <p className="font-medium">{viewingReport?.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Course Popularity</p>
                <p className="font-medium">{viewingReport?.coursePopularity}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">User Engagement</p>
                <p className="font-medium">{viewingReport?.userEngagement}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="font-medium">{viewingReport?.completionRate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Time Period</p>
                <p className="font-medium">{viewingReport?.timePeriod}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Generated At</p>
                <p className="font-medium">{viewingReport?.generatedAt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(viewingReport?.status || "")}`}>
                  {viewingReport?.status}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Report Dialog */}
      <Dialog 
        open={isAddDialogOpen || !!editingReport} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingReport(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingReport ? "Edit Report" : "Add New Report"}</DialogTitle>
            <DialogDescription>
              {editingReport ? "Update the report details below." : "Fill in the report details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportId">Report ID</Label>
              <Input
                id="reportId"
                value={formData.reportId}
                onChange={(e) => setFormData({ ...formData, reportId: e.target.value })}
                placeholder="RPT-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter report title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Activity, Performance, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coursePopularity">Course Popularity</Label>
              <Input
                id="coursePopularity"
                value={formData.coursePopularity}
                onChange={(e) => setFormData({ ...formData, coursePopularity: e.target.value })}
                placeholder="High, Medium, Low"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEngagement">User Engagement</Label>
              <Input
                id="userEngagement"
                value={formData.userEngagement}
                onChange={(e) => setFormData({ ...formData, userEngagement: e.target.value })}
                placeholder="85%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completionRate">Completion Rate</Label>
              <Input
                id="completionRate"
                value={formData.completionRate}
                onChange={(e) => setFormData({ ...formData, completionRate: e.target.value })}
                placeholder="72%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timePeriod">Time Period</Label>
              <Input
                id="timePeriod"
                value={formData.timePeriod}
                onChange={(e) => setFormData({ ...formData, timePeriod: e.target.value })}
                placeholder="January 2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generatedAt">Generated At</Label>
              <Input
                id="generatedAt"
                value={formData.generatedAt}
                onChange={(e) => setFormData({ ...formData, generatedAt: e.target.value })}
                placeholder="2025-02-01 09:00:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as "Completed" | "Failed" | "Scheduled" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setEditingReport(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={editingReport ? handleEditReport : handleAddReport}>
              {editingReport ? "Update Report" : "Add Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingReport}
        onOpenChange={(open) => !open && setDeletingReport(null)}
        onConfirm={handleDeleteReport}
        title="Delete Report"
        description={`Are you sure you want to delete "${deletingReport?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
