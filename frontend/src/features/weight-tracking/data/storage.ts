export interface WeightLog {
  date: string;
  weight: number;
}

const STORAGE_KEY = 'weight-tracker-logs';

export const loadLogs = (): WeightLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading logs:', error);
    return [];
  }
};

export const saveLogs = (logs: WeightLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving logs:', error);
  }
};

export const exportLogs = (logs: WeightLog[]): void => {
  const dataStr = JSON.stringify(logs, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `weight-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importLogs = (file: File): Promise<WeightLog[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const logs = JSON.parse(e.target?.result as string);
        if (Array.isArray(logs)) {
          resolve(logs);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

export const exportCSVTemplate = (): void => {
  const csvContent = 'date,weight\n2025-01-01,70.5\n2025-01-02,70.3';
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'weight-tracker-template.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export const exportCSV = (logs: WeightLog[]): void => {
  const header = 'date,weight\n';
  const rows = logs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => `${log.date},${log.weight}`)
    .join('\n');
  const csvContent = header + rows;
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `weight-tracker-data-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const parseDate = (dateString: string): string | null => {
  const trimmed = dateString.trim();
  
  // Format: YYYY-MM-DD (ISO format)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return trimmed;
  }
  
  // Format: YYYY/MM/DD
  const yyyySlashRegex = /^(\d{4})\/(\d{2})\/(\d{2})$/;
  const yyyySlashMatch = trimmed.match(yyyySlashRegex);
  if (yyyySlashMatch) {
    const [, year, month, day] = yyyySlashMatch;
    const isoDate = `${year}-${month}-${day}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) return isoDate;
  }
  
  // Format: DD-MM-YY or DD-MM-YYYY
  const ddmmDashRegex = /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/;
  const ddmmDashMatch = trimmed.match(ddmmDashRegex);
  if (ddmmDashMatch) {
    let [, day, month, year] = ddmmDashMatch;
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    if (year.length === 2) {
      year = '20' + year;
    }
    const isoDate = `${year}-${month}-${day}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) return isoDate;
  }
  
  // Format: DD/MM/YY or DD/MM/YYYY
  const ddmmSlashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  const ddmmSlashMatch = trimmed.match(ddmmSlashRegex);
  if (ddmmSlashMatch) {
    let [, day, month, year] = ddmmSlashMatch;
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    if (year.length === 2) {
      year = '20' + year;
    }
    const isoDate = `${year}-${month}-${day}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) return isoDate;
  }
  
  // Format: DD.MM.YY or DD.MM.YYYY
  const ddmmDotRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/;
  const ddmmDotMatch = trimmed.match(ddmmDotRegex);
  if (ddmmDotMatch) {
    let [, day, month, year] = ddmmDotMatch;
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    if (year.length === 2) {
      year = '20' + year;
    }
    const isoDate = `${year}-${month}-${day}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) return isoDate;
  }
  
  // Format: MM/DD/YY or MM/DD/YYYY (US format)
  const mmddSlashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  const mmddSlashMatch = trimmed.match(mmddSlashRegex);
  if (mmddSlashMatch) {
    let [, month, day, year] = mmddSlashMatch;
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');
    if (year.length === 2) {
      year = '20' + year;
    }
    // Try US format (MM/DD/YYYY)
    const isoDate = `${year}-${month}-${day}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime()) && parseInt(month) <= 12 && parseInt(day) <= 31) {
      return isoDate;
    }
  }
  
  // Format: MM-DD-YY or MM-DD-YYYY (US format)
  const mmddDashRegex = /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/;
  const mmddDashMatch = trimmed.match(mmddDashRegex);
  if (mmddDashMatch) {
    let [, month, day, year] = mmddDashMatch;
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');
    if (year.length === 2) {
      year = '20' + year;
    }
    const isoDate = `${year}-${month}-${day}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime()) && parseInt(month) <= 12 && parseInt(day) <= 31) {
      return isoDate;
    }
  }
  
  // Format: YYYYMMDD (compact)
  const compactRegex = /^(\d{4})(\d{2})(\d{2})$/;
  const compactMatch = trimmed.match(compactRegex);
  if (compactMatch) {
    const [, year, month, day] = compactMatch;
    const isoDate = `${year}-${month}-${day}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) return isoDate;
  }
  
  return null;
};

export const importCSV = (file: File): Promise<WeightLog[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');
        
        if (lines.length < 2) {
          reject(new Error('CSV file is empty'));
          return;
        }
        
        const logs: WeightLog[] = [];
        const errors: string[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const [date, weight] = lines[i].split(',');
          const weightNum = parseFloat(weight?.trim());
          const parsedDate = parseDate(date);
          
          if (parsedDate && !isNaN(weightNum) && weightNum > 0) {
            logs.push({ date: parsedDate, weight: weightNum });
          } else {
            errors.push(`Row ${i + 1}: Invalid data (date: ${date?.trim()}, weight: ${weight?.trim()})`);
          }
        }
        
        if (logs.length === 0) {
          reject(new Error('No valid entries found in CSV. Supported formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, DD.MM.YYYY, YYYYMMDD, and variations with 2 or 4 digit years'));
          return;
        }
        
        resolve(logs);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
