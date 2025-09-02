import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PageSettings {
  title: string;
  subtitle: string;
  welcome_message: string;
}

export const usePageSettings = () => {
  const [settings, setSettings] = useState<PageSettings>({
    title: "Lap Lap Diaper",
    subtitle: "Acompanhe o estoque e o consumo de fraldas do seu bebê de forma simples e organizada",
    welcome_message: "Bem-vindo ao sistema de controle de fraldas"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageSettings();
    setupRealTimeSubscription();
  }, []);

  const loadPageSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("page_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setSettings({
          title: data.title || "Lap Lap Diaper",
          subtitle: data.subtitle || "Acompanhe o estoque e o consumo de fraldas do seu bebê de forma simples e organizada",
          welcome_message: data.welcome_message || "Bem-vindo ao sistema de controle de fraldas"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações da página:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel("page_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "page_settings"
        },
        () => {
          loadPageSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    settings,
    loading,
    refetch: loadPageSettings
  };
};