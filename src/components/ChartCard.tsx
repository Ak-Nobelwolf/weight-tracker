import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { WeightLog } from '@/utils/storage';

interface ChartCardProps {
  logs: WeightLog[];
}

export const ChartCard = ({ logs }: ChartCardProps) => {
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sortedLogs.map(log => ({
    date: format(parseISO(log.date), 'MMM dd'),
    fullDate: log.date,
    weight: log.weight,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">Progress Chart</h2>
        <div className="flex items-center justify-center h-48 sm:h-64 text-sm sm:text-base text-muted-foreground text-center px-4">
          No data to display. Start logging your weight!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">Progress Chart</h2>
      
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '0.75rem' }}
            className="sm:text-sm"
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '0.75rem' }}
            className="sm:text-sm"
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
            formatter={(value: number) => [`${value} kg`, 'Weight']}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            className="sm:stroke-[3]"
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
