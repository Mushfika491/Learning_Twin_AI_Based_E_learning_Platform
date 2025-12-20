import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, Eye, Plus } from "lucide-react";
import { UserFormDialog } from "./UserFormDialog";
import { UserDetailDialog } from "./UserDetailDialog";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export function UserManagementTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateNextUserId = () => {
    const maxId = users.reduce((max, user) => {
      const num = parseInt(user.user_id.replace('USR-', ''));
      return num > max ? num : max;
    }, 0);
    return `USR-${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleAddUser = async (userData: any) => {
    const newUserId = generateNextUserId();
    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: newUserId,
        name: userData.name,
        phone_number: userData.phoneNumber,
        email: userData.email,
        role: userData.role,
        status: userData.status
      });

    if (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    } else {
      toast.success('User added successfully');
      fetchUsers();
    }
    setIsAddingUser(false);
  };

  const handleEditUser = async (userData: any) => {
    if (!editingUser) return;

    const { error } = await supabase
      .from('admin_users')
      .update({
        name: userData.name,
        phone_number: userData.phoneNumber,
        email: userData.email,
        role: userData.role,
        status: userData.status
      })
      .eq('id', editingUser.id);

    if (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } else {
      toast.success('User updated successfully');
      fetchUsers();
    }
    setEditingUser(null);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', deletingUser.id);

    if (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } else {
      toast.success('User deleted successfully');
      fetchUsers();
    }
    setDeletingUser(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Information</h3>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by User ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsAddingUser(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.user_id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'Issued' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>{user.created_at}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingUser(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingUser(user)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        open={isAddingUser}
        onOpenChange={(open) => !open && setIsAddingUser(false)}
        onSubmit={handleAddUser}
        title="Add New User"
      />

      <UserFormDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSubmit={handleEditUser}
        initialData={editingUser ? {
          name: editingUser.name,
          email: editingUser.email,
          phoneNumber: editingUser.phone_number,
          role: editingUser.role,
          status: editingUser.status
        } : undefined}
        title="Edit User"
      />

      <UserDetailDialog
        open={!!viewingUser}
        onOpenChange={(open) => !open && setViewingUser(null)}
        user={viewingUser ? {
          id: viewingUser.user_id,
          name: viewingUser.name,
          email: viewingUser.email,
          phoneNumber: viewingUser.phone_number,
          role: viewingUser.role,
          status: viewingUser.status,
          createdAt: viewingUser.created_at
        } : null}
      />

      <DeleteConfirmDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete ${deletingUser?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
