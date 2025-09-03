import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Baby, 
  Settings, 
  BarChart3, 
  Gift, 
  ShoppingCart, 
  Activity, 
  Package, 
  Calendar,
  MapPin,
  Link,
  Heart,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UserDetailedStats {
  user_info: {
    id: string;
    email: string;
    display_name: string;
    is_admin: boolean;
    super_admin: boolean;
    created_at: string;
  };
  baby_info: Array<{
    id: string;
    name: string;
    url_slug: string;
    birth_date: string;
    is_born: boolean;
    gender: string;
    birth_place: string;
    parent1_name: string;
    parent2_name: string;
    created_at: string;
  }> | null;
  page_settings: {
    title: string;
    subtitle: string;
    welcome_message: string;
  } | null;
  diaper_stats: {
    total_donations: number;
    total_donated_quantity: number;
    total_purchases: number;
    total_purchased_quantity: number;
    total_usage: number;
    total_used_quantity: number;
    current_stock: number;
  };
  age_groups: Array<{
    id: string;
    name: string;
    age_range: string;
    estimated_quantity: number;
    price_per_unit: number;
    color_theme: string;
    icon_name: string;
    current_stock: number;
  }> | null;
  recent_activities: {
    recent_donations: Array<{
      id: string;
      quantity: number;
      donor_name: string;
      donation_date: string;
      age_group_name: string;
    }> | null;
    recent_usage: Array<{
      id: string;
      quantity: number;
      usage_date: string;
      age_group_name: string;
    }> | null;
  };
}

export const UserDetailsModal = ({ userId, isOpen, onClose }: UserDetailsModalProps) => {
  const [stats, setStats] = useState<UserDetailedStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserStats();
    }
  }, [isOpen, userId]);

  const fetchUserStats = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_detailed_stats', {
        target_user_id: userId
      });
      
      if (error) throw error;
      
      setStats(data as unknown as UserDetailedStats);
    } catch (error: any) {
      toast.error('Erro ao carregar estatísticas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStats(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : stats ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="babies">Bebês</TabsTrigger>
              <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* User Info */}
              <Card className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{stats.user_info.display_name || 'Usuário'}</h3>
                    <p className="text-muted-foreground">{stats.user_info.email}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {stats.user_info.super_admin && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Super Admin
                      </Badge>
                    )}
                    {stats.user_info.is_admin && !stats.user_info.super_admin && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cadastrado em {format(new Date(stats.user_info.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </Card>

              {/* Page Settings */}
              {stats.page_settings && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Configurações da Página</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Título:</p>
                      <p className="text-sm text-muted-foreground">{stats.page_settings.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Subtítulo:</p>
                      <p className="text-sm text-muted-foreground">{stats.page_settings.subtitle}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mensagem de Boas-vindas:</p>
                      <p className="text-sm text-muted-foreground">{stats.page_settings.welcome_message}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bebês</p>
                      <p className="text-xl font-bold">{stats.baby_info?.length || 0}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estoque</p>
                      <p className="text-xl font-bold">{stats.diaper_stats.current_stock}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-pink-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Doações</p>
                      <p className="text-xl font-bold">{stats.diaper_stats.total_donations}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Usos</p>
                      <p className="text-xl font-bold">{stats.diaper_stats.total_usage}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="babies" className="space-y-4">
              {stats.baby_info && stats.baby_info.length > 0 ? (
                stats.baby_info.map((baby) => (
                  <Card key={baby.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Baby className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{baby.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link className="w-4 h-4" />
                            <span>{baby.url_slug}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={baby.is_born ? "default" : "secondary"}>
                        {baby.is_born ? "Nascido" : "Esperando"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {baby.birth_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{format(new Date(baby.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      )}
                      {baby.gender && baby.gender !== 'não_informado' && (
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-muted-foreground" />
                          <span className="capitalize">{baby.gender}</span>
                        </div>
                      )}
                      {baby.birth_place && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{baby.birth_place}</span>
                        </div>
                      )}
                      {baby.parent1_name && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{baby.parent1_name}</span>
                        </div>
                      )}
                      {baby.parent2_name && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{baby.parent2_name}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum bebê cadastrado</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-pink-500" />
                    <h3 className="text-lg font-semibold">Doações</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total de doações:</span>
                      <span className="font-medium">{stats.diaper_stats.total_donations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fraldas doadas:</span>
                      <span className="font-medium">{stats.diaper_stats.total_donated_quantity}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Compras</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total de compras:</span>
                      <span className="font-medium">{stats.diaper_stats.total_purchases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fraldas compradas:</span>
                      <span className="font-medium">{stats.diaper_stats.total_purchased_quantity}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold">Uso</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Registros de uso:</span>
                      <span className="font-medium">{stats.diaper_stats.total_usage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fraldas utilizadas:</span>
                      <span className="font-medium">{stats.diaper_stats.total_used_quantity}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Estoque Atual</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total em estoque:</span>
                      <span className="font-medium">{stats.diaper_stats.current_stock}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Age Groups */}
              {stats.age_groups && stats.age_groups.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Grupos Etários</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.age_groups.map((group) => (
                      <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-muted-foreground">{group.age_range}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{group.current_stock}/{group.estimated_quantity}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {group.price_per_unit.toFixed(2)}/un
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recent Donations */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-pink-500" />
                    <h3 className="text-lg font-semibold">Doações Recentes</h3>
                  </div>
                  {stats.recent_activities.recent_donations && stats.recent_activities.recent_donations.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recent_activities.recent_donations.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{donation.donor_name || 'Doador Anônimo'}</p>
                            <p className="text-sm text-muted-foreground">{donation.age_group_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{donation.quantity} fraldas</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(donation.donation_date), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Nenhuma doação recente</p>
                    </div>
                  )}
                </Card>

                {/* Recent Usage */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold">Usos Recentes</h3>
                  </div>
                  {stats.recent_activities.recent_usage && stats.recent_activities.recent_usage.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recent_activities.recent_usage.map((usage) => (
                        <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{usage.age_group_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(usage.usage_date), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{usage.quantity} fraldas</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Nenhum uso recente</p>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Erro ao carregar dados do usuário</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};