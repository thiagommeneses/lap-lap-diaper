import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RecentDonor {
  donor_name: string;
  donation_date: string;
  quantity: number;
  age_group_name: string;
}

export interface TopDonor {
  donor_name: string;
  total_donated: number;
  donation_count: number;
}

export const useDonorData = () => {
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonorData = async () => {
    try {
      // Buscar últimos doadores
      const { data: recentData, error: recentError } = await supabase
        .from('recent_donors')
        .select('*');

      if (recentError) throw recentError;

      // Buscar top doadores
      const { data: topData, error: topError } = await supabase
        .from('top_donors')
        .select('*');

      if (topError) throw topError;

      setRecentDonors(recentData || []);
      setTopDonors(topData || []);
    } catch (error: any) {
      console.error('Erro ao buscar dados de doadores:', error);
      // Não mostrar toast de erro para visitantes
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  return {
    recentDonors,
    topDonors,
    loading,
    refetch: fetchDonorData,
  };
};