import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface WeightInputProps {
  onLog: (date: string, weight: number) => void;
  lastWeight?: number;
}

export const WeightInput = ({ onLog, lastWeight }: WeightInputProps) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (date && weightNum > 0 && !isNaN(weightNum)) {
      onLog(date, weightNum);
      setWeight('');
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 text-foreground">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-lg sm:text-2xl font-bold bg-transparent border-none outline-none w-full"
            required
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (kg)"
            className="flex-1 h-12 sm:h-14 text-base sm:text-lg rounded-xl"
            required
          />
          <Button 
            type="submit" 
            size="lg"
            className="px-6 sm:px-8 rounded-xl text-base sm:text-lg font-semibold h-12 sm:h-14 w-full sm:w-auto"
          >
            Log Weight
          </Button>
        </div>

        {lastWeight !== undefined && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            Last logged: <span className="font-semibold text-foreground">{lastWeight} kg</span>
          </p>
        )}
      </form>
    </div>
  );
};
