import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Baby, 
  Heart, 
  Smile, 
  Star, 
  Package,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Gift,
  Trophy,
  Clock,
  TrendingUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface DiaperGroup {
  name: string;
  age_range: string;
  current_quantity: number;
  estimated_quantity: number;
  color_theme: string;
  icon_name: string;
  progress_percentage: number;
}

interface TopDonor {
  name: string;
  total_quantity: number;
  donation_count: number;
}

interface RecentDonor {
  name: string;
  quantity: number;
  age_group_name: string;
  donation_date: string;
  created_at: string;
}

interface DonationData {
  top_donors: TopDonor[];
  recent_donors: RecentDonor[];
  total_donations: number;
  total_donated: number;
}

interface BabyProfile {
  url_slug: string;
  name: string;
  birth_date: string | null;
  is_born: boolean;
  gender: string;
  birth_place: string | null;
  parent1_name: string | null;
  parent2_name: string | null;
  title: string;
  subtitle: string;
  welcome_message: string;
  diaper_groups: DiaperGroup[];
}

const iconMap = {
  Baby,
  Heart,
  Smile,
  Star,
};

const PublicBabyProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [donationData, setDonationData] = useState<DonationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Buscar perfil do bebê
        const { data: profileData, error: profileError } = await supabase.rpc('get_baby_profile_by_slug', {
          baby_slug: slug
        });

        if (profileError) throw profileError;

        if (!profileData || profileData.length === 0) {
          setNotFound(true);
        } else {
          const profile = profileData[0];
          // Parse diaper_groups JSON if it's a string
          let diaperGroups: DiaperGroup[] = [];
          if (profile.diaper_groups) {
            try {
              diaperGroups = typeof profile.diaper_groups === 'string' 
                ? JSON.parse(profile.diaper_groups)
                : profile.diaper_groups;
            } catch (e) {
              console.warn('Failed to parse diaper_groups:', e);
              diaperGroups = [];
            }
          }
          
          setProfile({
            ...profile,
            diaper_groups: diaperGroups
          });

          // Buscar dados dos doadores
          const { data: donationData, error: donationError } = await supabase.rpc('get_donation_data_by_slug', {
            baby_slug: slug
          });

          if (donationError) {
            console.warn('Erro ao buscar dados dos doadores:', donationError);
          } else if (donationData && donationData.length > 0) {
            const donation = donationData[0];
            setDonationData({
              top_donors: typeof donation.top_donors === 'string' ? JSON.parse(donation.top_donors) : donation.top_donors,
              recent_donors: typeof donation.recent_donors === 'string' ? JSON.parse(donation.recent_donors) : donation.recent_donors,
              total_donations: donation.total_donations,
              total_donated: donation.total_donated
            });
          }
        }
      } catch (error: any) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados');
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="card-baby p-8 text-center max-w-md">
          <Baby className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">
            Perfil não encontrado
          </h2>
          <p className="text-muted-foreground">
            Não conseguimos encontrar o perfil do bebê solicitado.
          </p>
        </Card>
      </div>
    );
  }

  const totalStock = profile.diaper_groups.reduce((acc, group) => acc + group.current_quantity, 0);
  const totalTarget = profile.diaper_groups.reduce((acc, group) => acc + group.estimated_quantity, 0);
  const progressPercentage = totalTarget > 0 ? Math.round((totalStock / totalTarget) * 100) : 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'masculino': return 'Menino';
      case 'feminino': return 'Menina';
      default: return 'Não informado';
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="hero-baby py-20 min-h-[60vh] flex items-center justify-center">
        <div className="hero-content container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Baby Icon */}
            <div className="bg-gradient-baby-blue p-6 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-[var(--shadow-card)] animate-bounce-gentle">
              <Baby className="w-12 h-12 text-foreground" />
            </div>
            
            {/* Welcome Text */}
            <h1 className="text-5xl md:text-6xl font-bold font-heading text-foreground mb-4">
              Sejam bem-vindos
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              {profile.subtitle}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {profile.welcome_message}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Baby Info */}
        <Card className="card-baby p-6 mb-8">
          <div className="text-center mb-6">
            <div className="bg-gradient-baby-blue p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Baby className="w-10 h-10 text-foreground" />
            </div>
            <h2 className="text-3xl font-bold font-heading text-foreground mb-2">
              {profile.name}
            </h2>
            <Badge variant="secondary" className="bg-baby-mint/20 text-foreground text-lg px-4 py-2">
              {getGenderDisplay(profile.gender)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile.birth_date && (
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-baby-blue" />
                <p className="font-medium text-foreground">Data de Nascimento</p>
                <p className="text-sm text-muted-foreground">{formatDate(profile.birth_date)}</p>
              </div>
            )}
            
            {profile.birth_place && (
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-baby-pink" />
                <p className="font-medium text-foreground">Local de Nascimento</p>
                <p className="text-sm text-muted-foreground">{profile.birth_place}</p>
              </div>
            )}

            {(profile.parent1_name || profile.parent2_name) && (
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-baby-mint" />
                <p className="font-medium text-foreground">Pais</p>
                <div className="text-sm text-muted-foreground">
                  {profile.parent1_name && <p>{profile.parent1_name}</p>}
                  {profile.parent2_name && <p>{profile.parent2_name}</p>}
                </div>
              </div>
            )}

            <div className="text-center p-4 bg-background/50 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-baby-yellow" />
              <p className="font-medium text-foreground">Status</p>
              <p className="text-sm text-muted-foreground">
                {profile.is_born ? 'Nascido' : 'Aguardando nascimento'}
              </p>
            </div>
          </div>
        </Card>

        {/* Stock Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-baby p-6 text-center">
            <div className="bg-gradient-baby-blue p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">{totalStock}</h3>
            <p className="text-muted-foreground">Fraldas em Estoque</p>
          </Card>
          
          <Card className="card-baby p-6 text-center">
            <div className="bg-gradient-baby-pink p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">{totalTarget}</h3>
            <p className="text-muted-foreground">Meta Total</p>
          </Card>
          
          <Card className="card-baby p-6 text-center">
            <div className="bg-gradient-baby-mint p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Star className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">{progressPercentage}%</h3>
            <p className="text-muted-foreground">Progresso</p>
          </Card>

          <Card className="card-baby p-6 text-center">
            <div className="bg-gradient-baby-yellow p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Gift className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">{donationData?.total_donated || 0}</h3>
            <p className="text-muted-foreground">Fraldas Doadas</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="card-baby p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-heading">Progresso Geral do Estoque</h2>
            <Badge variant="secondary" className="bg-baby-mint text-foreground">
              {totalTarget - totalStock} faltando
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-4 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalStock} fraldas</span>
            <span>Meta: {totalTarget} fraldas</span>
          </div>
        </Card>

        {/* Donation Stats */}
        {donationData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="card-baby p-6">
              <h3 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-baby-yellow" />
                Top 3 Doadores
              </h3>
              <div className="space-y-3">
                {donationData.top_donors.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum doador ainda</p>
                ) : (
                  donationData.top_donors.map((donor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-foreground ${
                          index === 0 ? 'bg-baby-yellow' : 
                          index === 1 ? 'bg-baby-mint' : 'bg-baby-pink'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <span className="text-foreground font-medium">{donor.name}</span>
                          <p className="text-sm text-muted-foreground">
                            {donor.donation_count} doações
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-baby-blue text-foreground">
                        {donor.total_quantity} fraldas
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
            
            <Card className="card-baby p-6">
              <h3 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-baby-mint" />
                Últimas Doações
              </h3>
              <div className="space-y-3">
                {donationData.recent_donors.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma doação recente</p>
                ) : (
                  donationData.recent_donors.map((donor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div>
                        <span className="text-foreground font-medium">{donor.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {donor.age_group_name} • {formatDate(donor.donation_date)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-baby-pink text-foreground">
                        {donor.quantity} fraldas
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="card-baby p-6">
              <h3 className="text-lg font-semibold font-heading text-foreground mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-baby-blue" />
                Estatísticas de Doação
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-baby-mint/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{donationData.total_donations}</div>
                  <p className="text-sm text-muted-foreground">Total de Doações</p>
                </div>
                <div className="text-center p-4 bg-baby-yellow/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{donationData.total_donated}</div>
                  <p className="text-sm text-muted-foreground">Fraldas Recebidas</p>
                </div>
                {donationData.total_donations > 0 && (
                  <div className="text-center p-4 bg-baby-blue/20 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {Math.round(donationData.total_donated / donationData.total_donations)}
                    </div>
                    <p className="text-sm text-muted-foreground">Média por Doação</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Diaper Groups */}
        {profile.diaper_groups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-heading text-foreground mb-6 text-center">
              Estoque por Faixa Etária
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profile.diaper_groups.map((group, index) => {
                const IconComponent = iconMap[group.icon_name as keyof typeof iconMap] || Baby;
                const themeColor = `gradient-baby-${group.color_theme}`;
                
                return (
                  <Card key={index} className="card-baby p-6">
                    <div className="text-center mb-4">
                      <div className={`bg-${themeColor} p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold font-heading text-foreground">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.age_range}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Estoque:</span>
                        <span className="font-medium text-foreground">{group.current_quantity}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Meta:</span>
                        <span className="font-medium text-foreground">{group.estimated_quantity}</span>
                      </div>
                      
                      <Progress value={group.progress_percentage} className="h-2" />
                      
                      <div className="text-center">
                        <Badge variant="secondary" className={`bg-baby-${group.color_theme}/20 text-foreground`}>
                          {group.progress_percentage}% completo
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p>Acompanhe o crescimento e desenvolvimento através deste painel personalizado</p>
        </div>
      </div>
    </div>
  );
};

export default PublicBabyProfile;