import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const mockInterventions = [
  { id: "1", student: "John Doe", date: "2024-01-15", type: "Meeting", notes: "Discussed attendance issues", outcome: "Positive" },
  { id: "2", student: "Sarah Wilson", date: "2024-01-14", type: "Email", notes: "Sent study resources", outcome: "Pending" },
  { id: "3", student: "Mike Brown", date: "2024-01-10", type: "Phone Call", notes: "Career counseling session", outcome: "Positive" },
];

export function InterventionLog() {
  const [interventions, setInterventions] = useState(mockInterventions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<any>(null);
  const [formData, setFormData] = useState({
    student: "",
    type: "",
    notes: "",
    outcome: "Pending",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIntervention) {
      setInterventions(interventions.map(i => 
        i.id === editingIntervention.id 
          ? { ...i, ...formData, date: new Date().toISOString().split('T')[0] } 
          : i
      ));
      setEditingIntervention(null);
    } else {
      setInterventions([...interventions, { 
        ...formData, 
        id: Date.now().toString(), 
        date: new Date().toISOString().split('T')[0] 
      }]);
    }
    setFormData({ student: "", type: "", notes: "", outcome: "Pending" });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (intervention: any) => {
    setEditingIntervention(intervention);
    setFormData(intervention);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setInterventions(interventions.filter(i => i.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Intervention Log</CardTitle>
            <CardDescription>Track student interventions and outcomes</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingIntervention(null);
            setFormData({ student: "", type: "", notes: "", outcome: "Pending" });
            setIsAddDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Intervention
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interventions.map((intervention) => (
                <TableRow key={intervention.id}>
                  <TableCell>{intervention.date}</TableCell>
                  <TableCell className="font-medium">{intervention.student}</TableCell>
                  <TableCell>{intervention.type}</TableCell>
                  <TableCell className="max-w-xs truncate">{intervention.notes}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      intervention.outcome === 'Positive' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {intervention.outcome}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(intervention)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(intervention.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingIntervention ? "Edit" : "Add"} Intervention</DialogTitle>
              <DialogDescription>
                {editingIntervention ? "Update intervention details" : "Record a new student intervention"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student Name</Label>
                <Input
                  id="student"
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Intervention Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Meeting, Email, Phone Call"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIntervention ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
