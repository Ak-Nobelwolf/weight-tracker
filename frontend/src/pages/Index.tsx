import { useState, useEffect, useRef } from 'react';
import { WeightInput } from '@/features/weight-tracking/components/WeightInput';
import { AnalyticsCard } from '@/features/weight-tracking/components/AnalyticsCard';
import { ChartCard } from '@/features/weight-tracking/components/ChartCard';
import { HistoryTable } from '@/features/weight-tracking/components/HistoryTable';
import { DataOptions } from '@/features/weight-tracking/components/DataOptions';
import { WeightLog, loadLogs, saveLogs } from '@/features/weight-tracking/data/storage';
import { calculateStats, editLog, removeLog, upsertLog } from '@/features/weight-tracking/data/weight-log-operations';
import { useToast } from '@/hooks/use-toast';
import { Scale } from 'lucide-react';

const Index = () => {
  const [logs, setLogs] = useState<WeightLog[]>(() => loadLogs());
  const { toast } = useToast();
  const isInitialMount = useRef(true);

  // Save logs to localStorage whenever they change (except on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveLogs(logs);
  }, [logs]);

  const handleLog = (date: string, weight: number) => {
    setLogs(prevLogs => {
      const wasExisting = prevLogs.some(log => log.date === date);

      if (wasExisting) {
        toast({
          title: 'Weight updated',
          description: `Updated weight for ${date} to ${weight} kg`,
        });
      } else {
        toast({
          title: 'Weight logged',
          description: `Logged ${weight} kg for ${date}`,
        });
      }

      return upsertLog(prevLogs, { date, weight });
    });
  };

  const handleDelete = (date: string) => {
    setLogs(prevLogs => removeLog(prevLogs, date));
    toast({
      title: 'Weight deleted',
      description: `Removed entry for ${date}`,
    });
  };

  const handleEdit = (oldDate: string, newDate: string, newWeight: number) => {
    setLogs(prevLogs => {
      const hasExistingTarget = prevLogs.some(log => log.date !== oldDate && log.date === newDate);

      if (hasExistingTarget) {
        toast({
          title: 'Weight updated',
          description: `Updated weight for ${newDate} to ${newWeight} kg`,
        });
      } else {
        toast({
          title: 'Weight updated',
          description: `Changed from ${oldDate} to ${newDate} with ${newWeight} kg`,
        });
      }

      return editLog(prevLogs, oldDate, { date: newDate, weight: newWeight });
    });
  };

  const handleImport = (importedLogs: WeightLog[]) => {
    setLogs(importedLogs);
  };

  const stats = calculateStats(logs);
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
