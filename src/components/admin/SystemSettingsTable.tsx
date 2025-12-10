import { useState } from "react";
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
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";

interface SystemSetting {
  id: string;
  settingId: string;
  settingName: string;
  settingValue: string;
  category: string;
  updatedAt: string;
}

const mockSettings: SystemSetting[] = [
  {
    id: "1",
    settingId: "SET-001",
    settingName: "Site Title",
    settingValue: "Learning Twin Platform",
    category: "General",
    updatedAt: "2025-02-01 09:00:00",
  },
  {
    id: "2",
    settingId: "SET-002",
    settingName: "Max Upload Size",
    settingValue: "50MB",
    category: "Storage",
    updatedAt: "2025-02-01 10:30:00",
  },
  {
    id: "3",
    settingId: "SET-003",
    settingName: "Session Timeout",
    settingValue: "30 minutes",
    category: "Security",
    updatedAt: "2025-02-01 11:15:00",
  },
  {
    id: "4",
    settingId: "SET-004",
    settingName: "Email Notifications",
    settingValue: "Enabled",
    category: "Notifications",
    updatedAt: "2025-02-01 14:00:00",
  },
  {
    id: "5",
    settingId: "SET-005",
    settingName: "Maintenance Mode",
    settingValue: "Disabled",
    category: "General",
    updatedAt: "2025-02-01 16:45:00",
  },
];

const categories = ["General", "Storage", "Security", "Notifications", "Performance"];

export function SystemSettingsTable() {
  const [settings, setSettings] = useState<SystemSetting[]>(mockSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    settingId: "",
    settingName: "",
    settingValue: "",
    category: "",
  });

  const filteredSettings = settings.filter((setting) =>
    setting.settingId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setIsEditMode(false);
    setFormData({
      settingId: `SET-${String(settings.length + 1).padStart(3, "0")}`,
      settingName: "",
      settingValue: "",
      category: "",
    });
    setIsAddEditDialogOpen(true);
  };

  const handleEdit = (setting: SystemSetting) => {
    setIsEditMode(true);
    setSelectedSetting(setting);
    setFormData({
      settingId: setting.settingId,
      settingName: setting.settingName,
      settingValue: setting.settingValue,
      category: setting.category,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleDelete = (setting: SystemSetting) => {
    setSelectedSetting(setting);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSetting) {
      setSettings(settings.filter((s) => s.id !== selectedSetting.id));
      toast({
        title: "Setting Deleted",
        description: `Setting ${selectedSetting.settingId} has been deleted.`,
      });
    }
    setIsDeleteDialogOpen(false);
    setSelectedSetting(null);
  };

  const handleSave = () => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    if (isEditMode && selectedSetting) {
      setSettings(
        settings.map((s) =>
          s.id === selectedSetting.id
            ? {
                ...s,
                settingId: formData.settingId,
                settingName: formData.settingName,
                settingValue: formData.settingValue,
                category: formData.category,
                updatedAt: now,
              }
            : s
        )
      );
      toast({
        title: "Setting Updated",
        description: `Setting ${formData.settingId} has been updated.`,
      });
    } else {
      const newSetting: SystemSetting = {
        id: String(Date.now()),
        settingId: formData.settingId,
        settingName: formData.settingName,
        settingValue: formData.settingValue,
        category: formData.category,
        updatedAt: now,
      };
      setSettings([...settings, newSetting]);
      toast({
        title: "Setting Added",
        description: `Setting ${formData.settingId} has been added.`,
      });
    }
    setIsAddEditDialogOpen(false);
    setSelectedSetting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Setting ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Setting
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setting ID</TableHead>
              <TableHead>Setting Name</TableHead>
              <TableHead>Setting Value</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSettings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No settings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">{setting.settingId}</TableCell>
                  <TableCell>{setting.settingName}</TableCell>
                  <TableCell>{setting.settingValue}</TableCell>
                  <TableCell>{setting.category}</TableCell>
                  <TableCell>{setting.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(setting)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(setting)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Setting" : "Add New Setting"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the setting details below."
                : "Fill in the details for the new setting."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="settingId">Setting ID</Label>
              <Input
                id="settingId"
                value={formData.settingId}
                onChange={(e) => setFormData({ ...formData, settingId: e.target.value })}
                disabled={isEditMode}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settingName">Setting Name</Label>
              <Input
                id="settingName"
                value={formData.settingName}
                onChange={(e) => setFormData({ ...formData, settingName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="settingValue">Setting Value</Label>
              <Input
                id="settingValue"
                value={formData.settingValue}
                onChange={(e) => setFormData({ ...formData, settingValue: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{isEditMode ? "Save Changes" : "Add Setting"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Setting"
        description={`Are you sure you want to delete setting "${selectedSetting?.settingId}"? This action cannot be undone.`}
      />
    </div>
  );
}
