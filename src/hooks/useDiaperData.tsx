import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AgeGroupWithStock {
  id: string;
  name: string;
  age_range: string;
  estimated_quantity: number;
  price_per_unit: number;
  color_theme: string;
  icon_name: string;
  current_quantity: number;
}

export interface DonationData {
  id: string;
  quantity: number;
  donor_name: string;
  donation_date: string;
  age_group_name: string;
}

export const useDiaperData = () => {
  const [ageGroups, setAgeGroups] = useState<AgeGroupWithStock[]>([]);
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Buscar grupos de idade com estoque
      const { data: ageGroupsData, error: ageGroupsError } = await supabase
        .from('diaper_age_groups')
        .select(`
          *,
          diaper_stock(current_quantity)
        `)
        .order('created_at');

      if (ageGroupsError) throw ageGroupsError;

      // SEGURANÇA: Não tentar buscar detalhes de doações para usuários não autenticados
      // Apenas administradores podem ver informações pessoais dos doadores
      let donationsData = [];
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          // Verificar se é admin antes de tentar buscar doações
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.user.id)
            .single();
          
          if (profile?.is_admin) {
            const { data: adminDonations } = await supabase
              .from('diaper_donations')
              .select(`
                *,
                diaper_age_groups(name)
              `)
              .order('created_at', { ascending: false })
              .limit(10);
            
            donationsData = adminDonations || [];
          }
        }
      } catch (donationError) {
        // Erro esperado para usuários não administradores - silenciar
        console.log('Acesso a doações restrito (comportamento normal para usuários públicos)');
      }

      // Formatar dados dos grupos de idade
      const formattedAgeGroups: AgeGroupWithStock[] = (ageGroupsData || []).map(group => ({
        id: group.id,
        name: group.name,
        age_range: group.age_range,
        estimated_quantity: group.estimated_quantity,
        price_per_unit: group.price_per_unit,
        color_theme: group.color_theme,
        icon_name: group.icon_name,
        current_quantity: group.diaper_stock?.[0]?.current_quantity || 0,
      }));

      // Formatar dados das doações (apenas para admins)
      const formattedDonations: DonationData[] = (donationsData || []).map((donation: any) => ({
        id: donation.id,
        quantity: donation.quantity,
        donor_name: donation.donor_name || 'Anônimo',
        donation_date: donation.donation_date,
        age_group_name: donation.diaper_age_groups?.name || 'N/A',
      }));

      setAgeGroups(formattedAgeGroups);
      setDonations(formattedDonations);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Configurar real-time updates para dados públicos
    const ageGroupsChannel = supabase
      .channel('age-groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diaper_age_groups'
        },
        () => fetchData()
      )
      .subscribe();

    const stockChannel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diaper_stock'
        },
        () => fetchData()
      )
      .subscribe();

    // SEGURANÇA: Realtime para doações apenas para usuários autenticados
    let donationsChannel: any = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        donationsChannel = supabase
          .channel('donations-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'diaper_donations'
            },
            () => fetchData()
          )
          .subscribe();
      }
    });

    return () => {
      supabase.removeChannel(ageGroupsChannel);
      supabase.removeChannel(stockChannel);
      if (donationsChannel) {
        supabase.removeChannel(donationsChannel);
      }
    };
  }, []);

  const getTotalStock = () => ageGroups.reduce((acc, group) => acc + group.current_quantity, 0);
  const getTotalTarget = () => ageGroups.reduce((acc, group) => acc + group.estimated_quantity, 0);
  const getProgressPercentage = () => {
    const total = getTotalTarget();
    if (total === 0) return 0;
    return Math.round((getTotalStock() / total) * 100);
  };

  const getShoppingList = () => {
    return ageGroups
      .filter(group => group.current_quantity < group.estimated_quantity)
      .map(group => ({
        name: group.name,
        needed: group.estimated_quantity - group.current_quantity,
        estimatedCost: (group.estimated_quantity - group.current_quantity) * group.price_per_unit
      }));
  };

  const getLowStockAlerts = () => {
    return ageGroups.filter(group => {
      const percentage = (group.current_quantity / group.estimated_quantity) * 100;
      return percentage < 30; // Menos de 30% do objetivo
    });
  };

  const getMonthlyAverage = () => {
    return ageGroups.map(group => ({
      id: group.id,
      name: group.name,
      monthlyAverage: Math.round(group.estimated_quantity / 12), // Dividir meta anual por 12 meses
      ageRange: group.age_range
    }));
  };

  return {
    ageGroups,
    donations,
    loading,
    getTotalStock,
    getTotalTarget,
    getProgressPercentage,
    getShoppingList,
    getLowStockAlerts,
    getMonthlyAverage,
    refetch: fetchData,
  };
};