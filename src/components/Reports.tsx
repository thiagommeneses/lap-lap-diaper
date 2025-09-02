import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Package, 
  Gift, 
  ShoppingCart, 
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  Minus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportData {
  totalDonations: number;
  totalDonationValue: number;
  totalStock: number;
  totalTarget: number;
  totalUsed: number;
  totalPurchased: number;
  monthlyDonations: Array<{
    month: string;
    donations: number;
    quantity: number;
  }>;
  monthlyUsage: Array<{
    month: string;
    usage: number;
  }>;
  ageGroupStats: Array<{
    name: string;
    current: number;
    target: number;
    donations: number;
    usage: number;
    percentage: number;
    color: string;
  }>;
  donationsByMonth: Array<{
    month: string;
    value: number;
  }>;
}

const COLORS = ['hsl(var(--baby-blue))', 'hsl(var(--baby-pink))', 'hsl(var(--baby-mint))', 'hsl(var(--baby-yellow))'];

export const Reports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | '365'>('30');

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Buscar grupos de idade com estoque
      const { data: ageGroups } = await supabase
        .from('diaper_age_groups')
        .select(`
          *,
          diaper_stock(current_quantity)
        `)
        .order('created_at');

      // Buscar doações
      const { data: donations } = await supabase
        .from('diaper_donations')
        .select(`
          *,
          diaper_age_groups(name, color_theme)
        `)
        .order('created_at', { ascending: false });

      // Buscar dados de uso
      const { data: usage } = await supabase
        .from('diaper_usage')
        .select(`
          *,
          diaper_age_groups(name, color_theme)
        `)
        .order('created_at', { ascending: false });

      if (!ageGroups || !donations) return;

      // Calcular totais
      const totalStock = ageGroups.reduce((acc, group) => 
        acc + (group.diaper_stock?.[0]?.current_quantity || 0), 0
      );
      
      const totalTarget = ageGroups.reduce((acc, group) => 
        acc + group.estimated_quantity, 0
      );

      const totalDonations = donations.length;
      const totalDonationQuantity = donations.reduce((acc, donation) => 
        acc + donation.quantity, 0
      );

      const totalDonationValue = donations.reduce((acc, donation) => {
        const ageGroup = ageGroups.find(ag => ag.id === donation.age_group_id);
        return acc + (donation.quantity * (ageGroup?.price_per_unit || 0));
      }, 0);

      // Calcular total usado baseado nos registros de uso
      const totalUsed = (usage || []).reduce((acc, u) => acc + u.quantity, 0);
      
      // Para "total comprado", vamos calcular baseado no que falta para atingir as metas
      const totalNeeded = Math.max(0, totalTarget - totalStock);
      const totalPurchased = totalNeeded; // Simplificação para o exemplo

      // Dados mensais das doações
      const monthlyData = (donations || []).reduce((acc: any, donation) => {
        const date = new Date(donation.donation_date);
        const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        if (!acc[monthKey]) {
          acc[monthKey] = { donations: 0, quantity: 0 };
        }
        acc[monthKey].donations += 1;
        acc[monthKey].quantity += donation.quantity;
        return acc;
      }, {});

      // Dados mensais de uso
      const monthlyUsageData = (usage || []).reduce((acc: any, use) => {
        const date = new Date(use.usage_date);
        const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        if (!acc[monthKey]) {
          acc[monthKey] = 0;
        }
        acc[monthKey] += use.quantity;
        return acc;
      }, {});

      const monthlyDonations = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
        month,
        donations: data.donations,
        quantity: data.quantity,
      })).slice(-6); // Últimos 6 meses

      const monthlyUsage = Object.entries(monthlyUsageData).map(([month, total]: [string, any]) => ({
        month,
        usage: total,
      })).slice(-6); // Últimos 6 meses

      // Estatísticas por faixa etária
      const ageGroupStats = ageGroups.map((group, index) => {
        const groupDonations = (donations || []).filter(d => d.age_group_id === group.id);
        const groupUsage = (usage || []).filter(u => u.age_group_id === group.id);
        const current = group.diaper_stock?.[0]?.current_quantity || 0;
        const target = group.estimated_quantity;
        const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
        
        return {
          name: group.name,
          current,
          target,
          donations: groupDonations.reduce((acc, d) => acc + d.quantity, 0),
          usage: groupUsage.reduce((acc, u) => acc + u.quantity, 0),
          percentage,
          color: COLORS[index % COLORS.length],
        };
      });

      // Doações por mês (valor monetário)
      const donationsByMonth = monthlyDonations.map(item => ({
        month: item.month,
        value: item.quantity * 0.85, // Preço médio estimado
      }));

      setReportData({
        totalDonations,
        totalDonationValue,
        totalStock,
        totalTarget,
        totalUsed,
        totalPurchased,
        monthlyDonations,
        monthlyUsage,
        ageGroupStats,
        donationsByMonth,
      });

    } catch (error: any) {
      console.error('Erro ao buscar dados do relatório:', error);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Erro ao carregar dados do relatório</p>
      </div>
    );
  }

  const progressPercentage = reportData.totalTarget > 0 
    ? Math.round((reportData.totalStock / reportData.totalTarget) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Filtros de Período */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-heading text-foreground">Relatório de Doações</h2>
        <div className="flex gap-2">
          {(['30', '90', '365'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? 'btn-baby-blue' : ''}
            >
              {period === '30' ? '30 dias' : period === '90' ? '3 meses' : '1 ano'}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="card-baby p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doações</p>
              <p className="text-2xl font-bold text-foreground">{reportData.totalDonations}</p>
            </div>
            <Gift className="w-8 h-8 text-baby-pink" />
          </div>
        </Card>

        <Card className="card-baby p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Arrecadado</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {reportData.totalDonationValue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-baby-mint" />
          </div>
        </Card>

        <Card className="card-baby p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estoque Atual</p>
              <p className="text-2xl font-bold text-foreground">{reportData.totalStock}</p>
            </div>
            <Package className="w-8 h-8 text-baby-blue" />
          </div>
        </Card>

        <Card className="card-baby p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Usado</p>
              <p className="text-2xl font-bold text-foreground">{reportData.totalUsed}</p>
            </div>
            <Minus className="w-8 h-8 text-baby-yellow" />
          </div>
        </Card>

        <Card className="card-baby p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Meta Atingida</p>
              <p className="text-2xl font-bold text-foreground">{progressPercentage}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-baby-yellow" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doações por Mês */}
        <Card className="card-baby p-6">
          <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
            Doações por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData.monthlyDonations}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="quantity" 
                stroke="hsl(var(--baby-blue))" 
                fill="hsl(var(--baby-blue))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Uso por Mês */}
        <Card className="card-baby p-6">
          <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
            Uso por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData.monthlyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="hsl(var(--baby-yellow))" 
                fill="hsl(var(--baby-yellow))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Estoque vs Uso por Faixa Etária */}
        <Card className="card-baby p-6">
          <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
            Estoque vs Uso por Faixa Etária
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.ageGroupStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="current" fill="hsl(var(--baby-mint))" name="Estoque" />
              <Bar dataKey="usage" fill="hsl(var(--baby-yellow))" name="Usado" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição do Estoque */}
        <Card className="card-baby p-6">
          <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
            Distribuição do Estoque
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.ageGroupStats}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="current"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {reportData.ageGroupStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Valor Arrecadado por Mês */}
        <Card className="card-baby p-6">
          <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
            Valor Arrecadado por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.donationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Valor']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--baby-yellow))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--baby-yellow))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Resumo de Performance */}
      <Card className="card-baby p-6">
        <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
          Performance e Uso por Faixa Etária
        </h3>
        <div className="space-y-4">
          {reportData.ageGroupStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: stat.color }}
                />
                <div>
                  <p className="font-medium text-foreground">{stat.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Estoque: {stat.current} / {stat.target} | Usado: {stat.usage}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={stat.percentage >= 80 ? 'default' : stat.percentage >= 50 ? 'secondary' : 'destructive'}
                  className={
                    stat.percentage >= 80 ? 'bg-baby-mint text-foreground' : 
                    stat.percentage >= 50 ? 'bg-baby-yellow text-foreground' : 
                    'bg-destructive text-destructive-foreground'
                  }
                >
                  {stat.percentage}%
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.donations} doações
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};