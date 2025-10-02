import { Download, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { WeightLog, exportLogs, importLogs, exportCSVTemplate, exportCSV, importCSV } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DataOptionsProps {
  logs: WeightLog[];
  onImport: (logs: WeightLog[]) => void;
}

export const DataOptions = ({ logs, onImport }: DataOptionsProps) => {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<WeightLog[] | null>(null);
  const [importType, setImportType] = useState<'json' | 'csv'>('json');

  const handleExport = () => {
    exportLogs(logs);
    toast({
      title: 'Data exported',
      description: 'Your weight logs have been downloaded as JSON.',
    });
  };

  const handleJSONImportClick = () => {
    jsonInputRef.current?.click();
  };

  const handleJSONFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedLogs = await importLogs(file);
      setPendingImport(importedLogs);
      setImportType('json');
      setShowImportConfirm(true);
    } catch (error) {
      toast({
        title: 'Restore failed',
        description: 'Invalid file format. Please select a valid JSON backup file.',
        variant: 'destructive',
      });
    }
    
    if (jsonInputRef.current) {
      jsonInputRef.current.value = '';
    }
  };

  const handleCSVTemplateDownload = () => {
    exportCSVTemplate();
    toast({
      title: 'Template downloaded',
      description: 'Use this CSV template to manually add your weight data.',
    });
  };

  const handleCSVExport = () => {
    exportCSV(logs);
    toast({
      title: 'CSV exported',
      description: 'Your weight logs have been exported as CSV.',
    });
  };

  const handleCSVImportClick = () => {
    csvInputRef.current?.click();
  };

  const handleCSVFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedLogs = await importCSV(file);
      const mergedLogs = [...logs];
      importedLogs.forEach(newLog => {
        const existingIndex = mergedLogs.findIndex(log => log.date === newLog.date);
        if (existingIndex >= 0) {
          mergedLogs[existingIndex] = newLog;
        } else {
          mergedLogs.push(newLog);
        }
      });
      setPendingImport(mergedLogs);
      setImportType('csv');
      setShowImportConfirm(true);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Invalid CSV format. Please check your file and try again.',
        variant: 'destructive',
      });
    }
    
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (pendingImport) {
      onImport(pendingImport);
      const action = importType === 'json' ? 'restored' : 'imported';
      toast({
        title: `Data ${action}`,
        description: `Successfully ${action} ${pendingImport.length} weight entries.`,
      });
      setPendingImport(null);
      setShowImportConfirm(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">Data Management</h2>
      
      <div className="space-y-6">
        {/* Backup & Restore Section */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-foreground">Backup & Restore</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button 
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Backup</span>
              <span className="sm:hidden">Export</span>
            </Button>
            
            <Button 
              onClick={handleJSONImportClick}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Restore Backup</span>
              <span className="sm:hidden">Restore</span>
            </Button>
            
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              onChange={handleJSONFileChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Backup as JSON and restore your complete weight history.
          </p>
        </div>

        <Separator />

        {/* Manual Data Import Section */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-foreground">Manual Data Import</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button 
              onClick={handleCSVTemplateDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Download Template</span>
              <span className="sm:hidden">Template</span>
            </Button>
            
            <Button 
              onClick={handleCSVExport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            
            <Button 
              onClick={handleCSVImportClick}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
            </Button>
            
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVFileChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Download CSV template, fill it with your data, and import it back.
          </p>
        </div>
      </div>

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Import</AlertDialogTitle>
            <AlertDialogDescription>
              {importType === 'json' 
                ? `This will replace your current ${logs.length} entries with ${pendingImport?.length || 0} entries from the backup file.`
                : `This will merge ${pendingImport?.length || 0} entries from CSV. Duplicate dates will be updated.`
              }
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImport(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              {importType === 'json' ? 'Restore Backup' : 'Import CSV'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
