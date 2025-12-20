import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  report_id: string;
  report_title: string;
  report_type: string;
  course_popularity: string;
  completion_rate: number;
  time_period: string;
  generated_at: string;
}

export function ReportsTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [deletingReport, setDeletingReport] = useState<Report | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Report>>({
    report_id: "",
    report_title: "",
    report_type: "",
    course_popularity: "",
    completion_rate: 0,
    time_period: "",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch reports: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.report_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.report_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.report_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteReport = async () => {
    if (!deletingReport) return;
    
    try {
      const { error } = await supabase
        .from('admin_reports')
        .delete()
        .eq('id', deletingReport.id);

      if (error) throw error;
      
      setReports(reports.filter(r => r.id !== deletingReport.id));
      setDeletingReport(null);
      toast.success("Report deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete report: " + error.message);
    }
  };

  const generateReportId = () => {
    const maxNum = reports.reduce((max, r) => {
      const num = parseInt(r.report_id.replace('R-', ''));
      return num > max ? num : max;
    }, 0);
    return `R-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const handleAddReport = async () => {
    try {
      const newReportId = formData.report_id || generateReportId();
      
      const { data, error } = await supabase
        .from('admin_reports')
        .insert({
          report_id: newReportId,
          report_title: formData.report_title || "",
          report_type: formData.report_type || "activity",
          course_popularity: formData.course_popularity || "Medium",
          completion_rate: formData.completion_rate || 0,
          time_period: formData.time_period || "",
        })
        .select()
        .single();

      if (error) throw error;
      
      setReports([data, ...reports]);
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Report added successfully");
    } catch (error: any) {
      toast.error("Failed to add report: " + error.message);
    }
  };

  const handleEditReport = async () => {
    if (!editingReport) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_reports')
        .update({
          report_id: formData.report_id,
          report_title: formData.report_title,
          report_type: formData.report_type,
          course_popularity: formData.course_popularity,
          completion_rate: formData.completion_rate,
          time_period: formData.time_period,
        })
        .eq('id', editingReport.id)
        .select()
        .single();

      if (error) throw error;
      
      setReports(reports.map(r => r.id === editingReport.id ? data : r));
      setEditingReport(null);
      resetForm();
      toast.success("Report updated successfully");
    } catch (error: any) {
      toast.error("Failed to update report: " + error.message);
    }
  };

  const openEditDialog = (report: Report) => {
    setFormData({
      report_id: report.report_id,
      report_title: report.report_title,
      report_type: report.report_type,
      course_popularity: report.course_popularity,
      completion_rate: report.completion_rate,
      time_period: report.time_period,
    });
    setEditingReport(report);
  };

  const resetForm = () => {
    setFormData({
      report_id: "",
      report_title: "",
      report_type: "",
      course_popularity: "",
      completion_rate: 0,
      time_period: "",
    });
  };

  const getPopularityStyle = (popularity: string) => {
    switch (popularity.toLowerCase()) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Report
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report ID</TableHead>
              <TableHead>Report Title</TableHead>
              <TableHead>Report Type</TableHead>
              <TableHead>Course Popularity</TableHead>
              <TableHead>Completion Rate</TableHead>
              <TableHead>Time Period</TableHead>
              <TableHead>Generated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.report_id}</TableCell>
                  <TableCell>{report.report_title}</TableCell>
                  <TableCell className="capitalize">{report.report_type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPopularityStyle(report.course_popularity)}`}>
                      {report.course_popularity}
                    </span>
                  </TableCell>
                  <TableCell>{report.completion_rate}%</TableCell>
                  <TableCell>{report.time_period}</TableCell>
                  <TableCell>{report.generated_at}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Report Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>View report information</DialogDescription>
          </DialogHeader>
          {viewingReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Report ID</Label>
                  <p className="font-medium">{viewingReport.report_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Report Title</Label>
                  <p className="font-medium">{viewingReport.report_title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Report Type</Label>
                  <p className="font-medium capitalize">{viewingReport.report_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Course Popularity</Label>
                  <p className="font-medium">{viewingReport.course_popularity}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Completion Rate</Label>
                  <p className="font-medium">{viewingReport.completion_rate}%</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time Period</Label>
                  <p className="font-medium">{viewingReport.time_period}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Generated At</Label>
                  <p className="font-medium">{viewingReport.generated_at}</p>
                </div>
              </div>
            </div>
          )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReport ? "Edit Report" : "Add New Report"}</DialogTitle>
            <DialogDescription>
              {editingReport ? "Update report information" : "Enter report details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report_id">Report ID</Label>
                <Input
                  id="report_id"
                  value={formData.report_id}
                  onChange={(e) => setFormData({ ...formData, report_id: e.target.value })}
                  placeholder="R-001"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report_title">Report Title</Label>
                <Input
                  id="report_title"
                  value={formData.report_title}
                  onChange={(e) => setFormData({ ...formData, report_title: e.target.value })}
                  placeholder="Monthly User Activity"
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report_type">Report Type</Label>
                <Select
                  value={formData.report_type}
                  onValueChange={(value) => setFormData({ ...formData, report_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course_popularity">Course Popularity</Label>
                <Select
                  value={formData.course_popularity}
                  onValueChange={(value) => setFormData({ ...formData, course_popularity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select popularity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="completion_rate">Completion Rate (%)</Label>
                <Input
                  id="completion_rate"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.completion_rate}
                  onChange={(e) => setFormData({ ...formData, completion_rate: parseInt(e.target.value) || 0 })}
                  placeholder="65"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_period">Time Period</Label>
                <Input
                  id="time_period"
                  value={formData.time_period}
                  onChange={(e) => setFormData({ ...formData, time_period: e.target.value })}
                  placeholder="JAN-2025"
                  maxLength={8}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingReport(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingReport ? handleEditReport : handleAddReport}>
              {editingReport ? "Save Changes" : "Add Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingReport}
        onOpenChange={(open) => !open && setDeletingReport(null)}
        onConfirm={handleDeleteReport}
        title="Delete Report"
        description={`Are you sure you want to delete "${deletingReport?.report_title}"? This action cannot be undone.`}
      />
    </div>
  );
}
