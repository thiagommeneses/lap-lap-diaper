import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface DiaperStatsCardProps {
  title: string;
  icon: ReactNode;
  count: number;
  total: number;
  ageRange: string;
  color: "blue" | "pink" | "purple" | "mint" | "yellow";
  monthlyAverage?: number;
}

const colorClasses = {
  blue: "bg-gradient-baby-blue",
  pink: "bg-gradient-baby-pink", 
  purple: "bg-gradient-baby-purple",
  mint: "bg-gradient-baby-mint",
  yellow: "bg-gradient-to-r from-baby-yellow to-baby-yellow-dark"
};

export const DiaperStatsCard = ({ 
  title, 
  icon, 
  count, 
  total, 
  ageRange, 
  color,
  monthlyAverage 
}: DiaperStatsCardProps) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <Card className="card-baby p-6 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${colorClasses[color]} animate-bounce-gentle`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-heading text-foreground">
            {count}
          </div>
          <div className="text-sm text-muted-foreground">
            de {total}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{ageRange}</p>
        
        {monthlyAverage && (
          <div className="bg-background/50 rounded-lg p-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Média mensal:</span>
              <span className="text-sm font-medium text-foreground">{monthlyAverage}/mês</span>
            </div>
          </div>
        )}
        
        <div className="progress-bar">
          <div 
            className={`progress-fill ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso</span>
          <span>{percentage}%</span>
        </div>
      </div>
    </Card>
  );
};