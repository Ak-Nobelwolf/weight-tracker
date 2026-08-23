import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsProps {
  average: number;
  min: number;
  max: number;
  first: number;
  last: number;
  change: number;
}

export const AnalyticsCard = ({ average, min, max, first, last, change }: AnalyticsProps) => {
  const isLoss = change < 0;
  const changeAbs = Math.abs(change);

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">Weight Analysis</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Average" value={average} unit="kg" />
        <StatCard label="Min" value={min} unit="kg" />
        <StatCard label="Max" value={max} unit="kg" />
        <StatCard 
          label="Trend" 
          value={changeAbs} 
          unit="kg"
          icon={isLoss ? <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
          valueClassName={isLoss ? 'text-success' : 'text-destructive'}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-accent/30 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">First Weight</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{first} <span className="text-sm sm:text-base font-normal">kg</span></p>
        </div>
        <div className="bg-accent/30 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Current Weight</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{last} <span className="text-sm sm:text-base font-normal">kg</span></p>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}

const StatCard = ({ label, value, unit, icon, valueClassName = 'text-foreground' }: StatCardProps) => (
  <div className="bg-accent/20 rounded-xl p-3 sm:p-4">
    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
    <div className="flex items-baseline gap-1 sm:gap-2">
      {icon && <span className={valueClassName}>{icon}</span>}
      <p className={`text-lg sm:text-2xl font-bold ${valueClassName}`}>
        {value.toFixed(1)} <span className="text-xs sm:text-base font-normal">{unit}</span>
      </p>
    </div>
  </div>
);
