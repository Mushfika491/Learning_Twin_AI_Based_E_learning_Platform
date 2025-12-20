import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface SystemSetting {
  id: string;
  setting_id: string;
  setting_title: string;
  category: string;
  updated_at: string;
}

const categories = ["General", "Storage", "Security", "Notifications", "Performance"];

export function SystemSettingsTable() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    setting_id: "",
    setting_title: "",
    category: "",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("setting_id", { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const filteredSettings = settings.filter((setting) =>
    setting.setting_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateNextSettingId = () => {
    const existingIds = settings.map(s => {
      const match = s.setting_id.match(/SET-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `SET-${String(maxId + 1).padStart(3, "0")}`;
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setFormData({
      setting_id: generateNextSettingId(),
      setting_title: "",
      category: "",
    });
    setIsAddEditDialogOpen(true);
  };

  const handleEdit = (setting: SystemSetting) => {
    setIsEditMode(true);
    setSelectedSetting(setting);
    setFormData({
      setting_id: setting.setting_id,
      setting_title: setting.setting_title,
      category: setting.category,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleDelete = (setting: SystemSetting) => {
    setSelectedSetting(setting);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSetting) {
      try {
        const { error } = await supabase
          .from("system_settings")
          .delete()
          .eq("id", selectedSetting.id);

        if (error) throw error;

        toast({
          title: "Setting Deleted",
          description: `Setting ${selectedSetting.setting_id} has been deleted.`,
        });
        fetchSettings();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete setting",
          variant: "destructive",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setSelectedSetting(null);
  };

  const handleSave = async () => {
    try {
      if (isEditMode && selectedSetting) {
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_id: formData.setting_id,
            setting_title: formData.setting_title,
            category: formData.category,
            updated_at: new Date().toISOString().split('T')[0],
          })
          .eq("id", selectedSetting.id);

        if (error) throw error;

        toast({
          title: "Setting Updated",
          description: `Setting ${formData.setting_id} has been updated.`,
        });
      } else {
        const { error } = await supabase
          .from("system_settings")
          .insert({
            setting_id: formData.setting_id,
            setting_title: formData.setting_title,
            category: formData.category,
          });

        if (error) throw error;

        toast({
          title: "Setting Added",
          description: `Setting ${formData.setting_id} has been added.`,
        });
      }
      fetchSettings();
      setIsAddEditDialogOpen(false);
      setSelectedSetting(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save setting",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

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
              <TableHead>Setting Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSettings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No settings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">{setting.setting_id}</TableCell>
                  <TableCell>{setting.setting_title}</TableCell>
                  <TableCell>{setting.category}</TableCell>
                  <TableCell>{setting.updated_at}</TableCell>
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
              <Label htmlFor="setting_id">Setting ID</Label>
              <Input
                id="setting_id"
                value={formData.setting_id}
                onChange={(e) => setFormData({ ...formData, setting_id: e.target.value })}
                disabled={isEditMode}
                maxLength={7}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="setting_title">Setting Title</Label>
              <Input
                id="setting_title"
                value={formData.setting_title}
                onChange={(e) => setFormData({ ...formData, setting_title: e.target.value })}
                maxLength={20}
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
        description={`Are you sure you want to delete setting "${selectedSetting?.setting_id}"? This action cannot be undone.`}
      />
    </div>
  );
}
