import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BabyUrlInfo {
  url_slug: string | null;
  baby_name: string | null;
  full_url: string | null;
}

export const useBabyUrl = () => {
  const { user } = useAuth();
  const [babyUrl, setBabyUrl] = useState<BabyUrlInfo>({
    url_slug: null,
    baby_name: null,
    full_url: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBabyUrl = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('baby_info')
          .select('url_slug, name')
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          const baseUrl = window.location.origin;
          setBabyUrl({
            url_slug: data.url_slug,
            baby_name: data.name,
            full_url: data.url_slug ? `${baseUrl}/${data.url_slug}` : null
          });
        }
      } catch (error) {
        console.error('Erro ao buscar URL do bebê:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBabyUrl();
  }, [user]);

  return { babyUrl, loading };
};