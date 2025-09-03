import { 
  Baby, 
  Heart, 
  Smile, 
  Star, 
  TrendingUp, 
  Package,
  AlertCircle,
  CheckCircle,
  Minus
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DiaperStatsCard } from "@/components/DiaperStatsCard";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BabyInfoDisplay } from "@/components/BabyInfoDisplay";
import { BabyUrlDisplay } from "@/components/BabyUrlDisplay";
import { useDiaperData } from "@/hooks/useDiaperData";
import { useAuth } from "@/contexts/AuthContext";

const iconMap = {
  Baby,
  Heart,
  Smile,
  Star,
};

const Index = () => {
  const { user } = useAuth();
  const { 
    ageGroups, 
    loading, 
    getTotalStock, 
    getTotalTarget, 
    getProgressPercentage,
    getShoppingList,
    getLowStockAlerts,
    getMonthlyAverage,
    getTotalUsage,
    getUsageByAgeGroup
  } = useDiaperData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Para usuários não autenticados, mostrar página pública simples
  if (!user) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <DashboardHeader />
          
          {/* Seção pública simplificada - sem dados sensíveis */}
          <Card className="card-baby p-8 text-center">
            <Baby className="w-16 h-16 mx-auto mb-4 text-baby-blue" />
            <h2 className="text-2xl font-bold font-heading text-foreground mb-4">
              Junte-se à nossa comunidade! 👶
            </h2>
            <p className="text-muted-foreground mb-6">
              Crie sua conta para gerenciar o estoque de fraldas do seu bebê e acompanhar seu crescimento.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-baby-blue/20 p-4 rounded-lg">
                <Package className="w-8 h-8 mx-auto mb-2 text-baby-blue" />
                <h3 className="font-semibold text-foreground">Controle de Estoque</h3>
                <p className="text-sm text-muted-foreground">Gerencie o estoque de fraldas por faixa etária</p>
              </div>
              <div className="bg-gradient-baby-pink/20 p-4 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-baby-pink" />
                <h3 className="font-semibold text-foreground">Relatórios</h3>
                <p className="text-sm text-muted-foreground">Acompanhe o consumo e planeje compras</p>
              </div>
              <div className="bg-gradient-baby-mint/20 p-4 rounded-lg">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-baby-mint" />
                <h3 className="font-semibold text-foreground">Dados Privados</h3>
                <p className="text-sm text-muted-foreground">Seus dados ficam seguros e privados</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-baby-mint text-foreground px-6 py-2 text-lg">
              Sistema privado e seguro para cada família 🔒
            </Badge>
          </Card>
        </div>
      </div>
    );
  }

  const totalDiapers = getTotalStock();
  const totalNeeded = getTotalTarget();
  const progressPercentage = getProgressPercentage();
  const shoppingList = getShoppingList();
  const lowStockAlerts = getLowStockAlerts();
  const monthlyAverages = getMonthlyAverage();
  const totalUsage = getTotalUsage();
  const usageByAgeGroup = getUsageByAgeGroup();

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <BabyInfoDisplay />
        <BabyUrlDisplay />
        
        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-baby p-6 text-center">
            <div className="bg-gradient-baby-blue p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">{totalDiapers}</h3>
            <p className="text-muted-foreground">Fraldas em Estoque</p>
          </Card>
          
          <Card className="card-baby p-6 text-center">
            <div className="bg-gradient-baby-pink p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">{totalNeeded}</h3>
            <p className="text-muted-foreground">Meta Total</p>
          </Card>
          
          <Card className="card-baby p-6 text-center">
            <div className="bg-gradient-baby-mint p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">{progressPercentage}%</h3>
            <p className="text-muted-foreground">Progresso Geral</p>
          </Card>

          <Card className="card-baby p-6 text-center">
            <div className="bg-gradient-baby-yellow p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Minus className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">{totalUsage}</h3>
            <p className="text-muted-foreground">Usadas (30 dias)</p>
          </Card>
        </div>

        {/* Barra de Progresso Geral */}
        <Card className="card-baby p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-heading">Progresso Geral do Estoque</h2>
            <Badge variant="secondary" className="bg-baby-mint text-foreground">
              {totalNeeded - totalDiapers} faltando
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-4 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalDiapers} fraldas</span>
            <span>Meta: {totalNeeded} fraldas</span>
          </div>
        </Card>

        {/* Cards por Faixa Etária */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-heading text-foreground mb-6 text-center">
            Estoque por Faixa Etária
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ageGroups.map((group) => {
              const IconComponent = iconMap[group.icon_name as keyof typeof iconMap] || Baby;
              const monthlyData = monthlyAverages.find(avg => avg.id === group.id);
              return (
                <DiaperStatsCard 
                  key={group.id}
                  title={group.name}
                  icon={<IconComponent className="w-6 h-6 text-foreground" />}
                  count={group.current_quantity}
                  total={group.estimated_quantity}
                  ageRange={group.age_range}
                  color={group.color_theme as any}
                  monthlyAverage={monthlyData?.monthlyAverage}
                />
              );
            })}
          </div>
        </div>

        {/* Alertas e Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="card-baby p-6">
            <h3 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              Alertas de Estoque
            </h3>
            <div className="space-y-3">
              {lowStockAlerts.length === 0 ? (
                <div className="flex items-center justify-between p-3 bg-baby-mint/20 rounded-lg">
                  <span className="text-foreground">Todos os estoques estão OK</span>
                  <Badge variant="secondary" className="bg-baby-mint text-foreground">
                    Normal
                  </Badge>
                </div>
              ) : (
                lowStockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-baby-yellow/20 rounded-lg">
                    <span style={{color: "tomato"}} className="text-foreground">{alert.name} - Estoque Baixo</span>
                    <Badge variant="secondary" className="bg-baby-yellow text-foreground">
                      Atenção
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
          
          <Card className="card-baby p-6">
            <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
              Lista de Compras (Total Sugerida)
            </h3>
            <div className="space-y-3">
              {shoppingList.length === 0 ? (
                <p className="text-muted-foreground">Estoque completo! 🎉</p>
              ) : (
                <>
                  {shoppingList.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-foreground">{item.name}</span>
                      <span className="font-medium text-foreground">{item.needed} unidades</span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground">
                      Estimativa total (até o desfralde): <span className="font-medium text-foreground">
                        R$ {shoppingList.reduce((acc, item) => acc + item.estimatedCost, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="card-baby p-6">
            <h3 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center">
              <Minus className="w-5 h-5 mr-2 text-baby-blue" />
              Uso por Faixa Etária (30 dias)
            </h3>
            <div className="space-y-3">
              {usageByAgeGroup.length === 0 ? (
                <p className="text-muted-foreground">Nenhum uso registrado</p>
              ) : (
                usageByAgeGroup.map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div>
                      <span className="text-foreground font-medium">{usage.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {usage.averageDaily} por dia (média)
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-baby-blue text-foreground">
                      {usage.totalUsed} usadas
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;