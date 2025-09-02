import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Calendar, MapPin, Users, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BabyInfo {
  name: string;
  birth_date: string;
  is_born: boolean;
  gender: string;
  birth_place: string;
  parent1_name: string;
  parent2_name: string;
}

export const BabyInfoDisplay = () => {
  const [babyInfo, setBabyInfo] = useState<BabyInfo | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    loadBabyInfo();
  }, []);

  const loadBabyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('baby_info')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setBabyInfo(data);
        
        if (data.birth_date && !data.is_born) {
          const today = new Date();
          const birthDate = new Date(data.birth_date);
          const diffTime = birthDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(diffDays);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar informações do bebê:', error);
    }
  };

  if (!babyInfo) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getGenderIcon = () => {
    if (babyInfo.gender === 'masculino') return '👶🏻';
    if (babyInfo.gender === 'feminino') return '👶🏻';
    return '👶';
  };

  const parents = [babyInfo.parent1_name, babyInfo.parent2_name].filter(Boolean);

  return (
    <Card className="bg-gradient-to-br from-baby-pink/20 via-baby-blue/10 to-baby-mint/20 border-border/50 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-gradient-baby-pink p-4 rounded-full animate-float">
            <Baby className="w-8 h-8 text-foreground" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-2">
              {getGenderIcon()} {babyInfo.name}
            </h2>
            
            {babyInfo.birth_date && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {babyInfo.is_born 
                    ? `Nasceu em ${formatDate(babyInfo.birth_date)}`
                    : `Previsto para ${formatDate(babyInfo.birth_date)}`
                  }
                </span>
              </div>
            )}
            
            {daysLeft !== null && daysLeft > 0 && (
              <div className="bg-baby-mint/20 px-3 py-1 rounded-full text-sm text-baby-mint font-medium">
                <Heart className="w-3 h-3 inline mr-1" />
                Faltam {daysLeft} dias!
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md text-sm">
            {babyInfo.birth_place && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-baby-blue" />
                <span>{babyInfo.birth_place}</span>
              </div>
            )}
            
            {parents.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-baby-pink" />
                <span>{parents.join(' & ')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};