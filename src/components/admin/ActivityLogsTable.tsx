import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  log_id: string;
  user_id: string;
  description: string;
  timestamps: string;
  status: string;
  source_ip_address: string;
}

interface AdminUser {
  user_id: string;
  name: string;
}

export function ActivityLogsTable() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingLog, setViewingLog] = useState<ActivityLog | null>(null);
  const [deleteLog, setDeleteLog] = useState<ActivityLog | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    description: "",
    status: "Success",
    source_ip_address: "",
  });

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select("*")
      .order("timestamps", { ascending: false });

    if (error) {
      toast.error("Failed to fetch activity logs");
      console.error(error);
    } else {
      setLogs(data || []);
    }
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id, name");

    if (error) {
      console.error("Failed to fetch users:", error);
    } else {
      setUsers(data || []);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.log_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateNextLogId = () => {
    if (logs.length === 0) return "LOG-001";
    const maxNum = Math.max(
      ...logs.map((l) => parseInt(l.log_id.replace("LOG-", "")) || 0)
    );
    return `LOG-${String(maxNum + 1).padStart(3, "0")}`;
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.user_id === userId);
    return user ? user.name : userId;
  };

  const handleAdd = () => {
    setEditingLog(null);
    setFormData({
      user_id: users.length > 0 ? users[0].user_id : "",
      description: "",
      status: "Success",
      source_ip_address: "",
    });
    setIsFormOpen(true);
  };

  const handleEdit = (log: ActivityLog) => {
    setEditingLog(log);
    setFormData({
      user_id: log.user_id,
      description: log.description,
      status: log.status,
      source_ip_address: log.source_ip_address,
    });
    setIsFormOpen(true);
  };

  const handleView = (log: ActivityLog) => {
    setViewingLog(log);
    setIsViewOpen(true);
  };

  const handleSave = async () => {
    if (!formData.user_id || !formData.description || !formData.source_ip_address) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingLog) {
      const { error } = await supabase
        .from("admin_activity_logs")
        .update({
          user_id: formData.user_id,
          description: formData.description,
          status: formData.status,
          source_ip_address: formData.source_ip_address,
          timestamps: new Date().toISOString().split("T")[0],
        })
        .eq("id", editingLog.id);

      if (error) {
        toast.error("Failed to update activity log");
        console.error(error);
      } else {
        toast.success("Activity log updated successfully");
        fetchLogs();
      }
    } else {
      const newLogId = generateNextLogId();
      const { error } = await supabase.from("admin_activity_logs").insert({
        log_id: newLogId,
        user_id: formData.user_id,
        description: formData.description,
        status: formData.status,
        source_ip_address: formData.source_ip_address,
      });

      if (error) {
        toast.error("Failed to add activity log");
        console.error(error);
      } else {
        toast.success("Activity log added successfully");
        fetchLogs();
      }
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteLog) return;

    const { error } = await supabase
      .from("admin_activity_logs")
      .delete()
      .eq("id", deleteLog.id);

    if (error) {
      toast.error("Failed to delete activity log");
      console.error(error);
    } else {
      toast.success("Activity log deleted successfully");
      fetchLogs();
    }
    setDeleteLog(null);
  };

  if (isLoading) {
    return <div className="p-6">Loading activity logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search activity logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Log
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Log ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source IP</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.log_id}</TableCell>
                <TableCell>{getUserName(log.user_id)}</TableCell>
                <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                <TableCell>{log.timestamps}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      log.status === "Success"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : log.status === "Failed"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {log.status}
                  </span>
                </TableCell>
                <TableCell>{log.source_ip_address}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleView(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(log)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteLog(log)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLog ? "Edit Activity Log" : "Add Activity Log"}
            </DialogTitle>
            <DialogDescription>
              {editingLog
                ? "Update the activity log details."
                : "Add a new activity log entry."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.name} ({user.user_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                maxLength={120}
                placeholder="Enter activity description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source_ip">Source IP Address</Label>
              <Input
                id="source_ip"
                value={formData.source_ip_address}
                onChange={(e) =>
                  setFormData({ ...formData, source_ip_address: e.target.value })
                }
                placeholder="e.g., 192.168.1.100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingLog ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activity Log Details</DialogTitle>
          </DialogHeader>
          {viewingLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Log ID</Label>
                  <p className="font-medium">{viewingLog.log_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{getUserName(viewingLog.user_id)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{viewingLog.description}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <p className="font-medium">{viewingLog.timestamps}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium">{viewingLog.status}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Source IP Address</Label>
                  <p className="font-medium">{viewingLog.source_ip_address}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteLog}
        onOpenChange={(open) => !open && setDeleteLog(null)}
        onConfirm={handleDelete}
        title="Delete Activity Log"
        description={`Are you sure you want to delete log "${deleteLog?.log_id}"? This action cannot be undone.`}
      />
    </div>
  );
}
