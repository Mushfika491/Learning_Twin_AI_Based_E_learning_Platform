import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const modelData = [
  { id: "1", name: "Student Predictor v2.1", accuracy: 94.2, f1: 0.923, latency: 45, status: "production" },
  { id: "2", name: "Engagement Analyzer v1.8", accuracy: 91.7, f1: 0.897, latency: 38, status: "production" },
  { id: "3", name: "Content Recommender v3.0", accuracy: 88.5, f1: 0.871, latency: 52, status: "testing" },
  { id: "4", name: "Performance Forecaster v1.5", accuracy: 86.3, f1: 0.845, latency: 41, status: "development" },
];

export function ModelComparison() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "production": return "bg-green-100 text-green-800";
      case "testing": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Name</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>F1 Score</TableHead>
                <TableHead>Latency (ms)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelData.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.accuracy}%</TableCell>
                  <TableCell>{model.f1}</TableCell>
                  <TableCell>{model.latency}ms</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
