import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

const mockProfiles: Profile[] = [
  { id: "1", userId: "USR-001", firstName: "John", lastName: "Doe", email: "john.doe@example.com", phoneNumber: "+1234567890", createdAt: "2025-02-01 09:00:00" },
  { id: "2", userId: "USR-002", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phoneNumber: "+1234567891", createdAt: "2025-02-02 10:30:00" },
  { id: "3", userId: "USR-003", firstName: "Mike", lastName: "Johnson", email: "mike.j@example.com", phoneNumber: "+1234567892", createdAt: "2025-02-03 14:15:00" },
];

export function AdminProfileTable() {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const filteredProfiles = profiles.filter(profile =>
    profile.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      userId: formData.userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
    };
    setProfiles([...profiles, newProfile]);
    setIsAddDialogOpen(false);
    setFormData({ userId: "", firstName: "", lastName: "", email: "", phoneNumber: "" });
  };

  const handleEdit = () => {
    if (!editingProfile) return;
    setProfiles(profiles.map(p =>
      p.id === editingProfile.id
        ? { ...editingProfile, ...formData }
        : p
    ));
    setEditingProfile(null);
    setFormData({ userId: "", firstName: "", lastName: "", email: "", phoneNumber: "" });
  };

  const handleDelete = () => {
    if (!deletingProfile) return;
    setProfiles(profiles.filter(p => p.id !== deletingProfile.id));
    setDeletingProfile(null);
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    });
  };

  const openAddDialog = () => {
    setFormData({ userId: "", firstName: "", lastName: "", email: "", phoneNumber: "" });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">My Profile</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Profile
        </Button>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by User ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.userId}</TableCell>
                <TableCell>{profile.firstName}</TableCell>
                <TableCell>{profile.lastName}</TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>{profile.phoneNumber}</TableCell>
                <TableCell>{profile.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(profile)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingProfile(profile)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfile(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingProfile}
        onOpenChange={() => setDeletingProfile(null)}
        onConfirm={handleDelete}
        title="Delete Profile"
        description={`Are you sure you want to delete profile "${deletingProfile?.firstName} ${deletingProfile?.lastName}"?`}
      />
    </div>
  );
}
