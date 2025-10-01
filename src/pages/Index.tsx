import { useState, useEffect } from 'react';
import { WeightInput } from '@/components/WeightInput';
import { AnalyticsCard } from '@/components/AnalyticsCard';
import { ChartCard } from '@/components/ChartCard';
import { HistoryTable } from '@/components/HistoryTable';
import { DataOptions } from '@/components/DataOptions';
import { WeightLog, loadLogs, saveLogs } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Scale } from 'lucide-react';

const Index = () => {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setLogs(loadLogs());
  }, []);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  const handleLog = (date: string, weight: number) => {
    setLogs(prevLogs => {
      const existingIndex = prevLogs.findIndex(log => log.date === date);
      
      if (existingIndex >= 0) {
        const updated = [...prevLogs];
        updated[existingIndex] = { date, weight };
        toast({
          title: 'Weight updated',
          description: `Updated weight for ${date} to ${weight} kg`,
        });
        return updated;
      } else {
        toast({
          title: 'Weight logged',
          description: `Logged ${weight} kg for ${date}`,
        });
        return [...prevLogs, { date, weight }];
      }
    });
  };

  const handleDelete = (date: string) => {
    setLogs(prevLogs => prevLogs.filter(log => log.date !== date));
    toast({
      title: 'Weight deleted',
      description: `Removed entry for ${date}`,
    });
  };

  const handleEdit = (oldDate: string, newDate: string, newWeight: number) => {
    setLogs(prevLogs => {
      const filtered = prevLogs.filter(log => log.date !== oldDate);
      const existingIndex = filtered.findIndex(log => log.date === newDate);
      
      if (existingIndex >= 0) {
        filtered[existingIndex] = { date: newDate, weight: newWeight };
        toast({
          title: 'Weight updated',
          description: `Updated weight for ${newDate} to ${newWeight} kg`,
        });
        return filtered;
      } else {
        toast({
          title: 'Weight updated',
          description: `Changed from ${oldDate} to ${newDate} with ${newWeight} kg`,
        });
        return [...filtered, { date: newDate, weight: newWeight }];
      }
    });
  };

  const handleImport = (importedLogs: WeightLog[]) => {
    setLogs(importedLogs);
  };

  const calculateStats = () => {
    if (logs.length === 0) {
      return { average: 0, min: 0, max: 0, first: 0, last: 0, change: 0 };
    }

    const weights = logs.map(log => log.weight);
    const sortedByDate = [...logs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const average = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const first = sortedByDate[0].weight;
    const last = sortedByDate[sortedByDate.length - 1].weight;
    const change = last - first;

    return { average, min, max, first, last, change };
  };

  const stats = calculateStats();
  const lastWeight = logs.length > 0 ? logs[logs.length - 1].weight : undefined;

  return (
    <div className="min-h-screen bg-gradient-app py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <header className="text-center mb-4 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Weight Tracker</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Track your progress, reach your goals</p>
        </header>

        <WeightInput onLog={handleLog} lastWeight={lastWeight} />

        {logs.length > 0 && (
          <>
            <AnalyticsCard {...stats} />
            <ChartCard logs={logs} />
            <HistoryTable logs={logs} onDelete={handleDelete} onEdit={handleEdit} />
          </>
        )}

        <DataOptions logs={logs} onImport={handleImport} />
      </div>
    </div>
  );
};

export default Index;
