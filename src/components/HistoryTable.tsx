import { Trash2, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WeightLog } from '@/utils/storage';
import { useState } from 'react';

interface HistoryTableProps {
  logs: WeightLog[];
  onDelete: (date: string) => void;
  onEdit: (oldDate: string, newDate: string, newWeight: number) => void;
}

export const HistoryTable = ({ logs, onDelete, onEdit }: HistoryTableProps) => {
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleEditClick = (log: WeightLog) => {
    setEditingLog(log);
    setEditDate(log.date);
    setEditWeight(log.weight.toString());
    setIsDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editingLog && editDate && editWeight) {
      const weightNum = parseFloat(editWeight);
      if (weightNum > 0) {
        onEdit(editingLog.date, editDate, weightNum);
        setIsDialogOpen(false);
        setEditingLog(null);
      }
    }
  };

  if (sortedLogs.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">History</h2>
        <div className="text-center py-12 text-muted-foreground">
          No weight logs yet. Start tracking your progress!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">History</h2>
      
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">Weight</th>
                <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((log, index) => (
                <tr 
                  key={log.date} 
                  className={`border-b border-border last:border-0 ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                  }`}
                >
                  <td className="py-3 px-2 sm:px-4 text-sm sm:text-base text-foreground font-medium">
                    {format(parseISO(log.date), 'yyyy-MM-dd')}
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-sm sm:text-base text-foreground font-semibold">
                    {log.weight.toFixed(1)} kg
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(log)}
                            className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8 p-0"
                          >
                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </DialogTrigger>
                        {editingLog?.date === log.date && (
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Weight Entry</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-date">Date</Label>
                                <Input
                                  id="edit-date"
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-weight">Weight (kg)</Label>
                                <Input
                                  id="edit-weight"
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={editWeight}
                                  onChange={(e) => setEditWeight(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleEditSave}>
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(log.date)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
