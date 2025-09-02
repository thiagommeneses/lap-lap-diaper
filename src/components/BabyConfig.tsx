import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Baby, Heart, Check, X, Loader2, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUrlSlugValidation } from "@/hooks/useUrlSlugValidation";

interface BabyInfo {
  id?: string;
  name: string;
  birth_date: string;
  is_born: boolean;
  gender: string;
  birth_place: string;
  parent1_name: string;
  parent2_name: string;
  url_slug?: string;
}

export const BabyConfig = () => {
  const { toast } = useToast();
  const [babyInfo, setBabyInfo] = useState<BabyInfo>({
    name: "",
    birth_date: "",
    is_born: false,
    gender: "não_informado",
    birth_place: "",
    parent1_name: "",
    parent2_name: "",
    url_slug: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL validation hook
  const { validationResult, validateSlug } = useUrlSlugValidation(babyInfo.name, babyInfo.url_slug);

  // Debounced URL validation
  useEffect(() => {
    if (babyInfo.url_slug) {
      const timeoutId = setTimeout(() => {
        validateSlug(babyInfo.url_slug);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [babyInfo.url_slug, validateSlug]);

  // Auto-fill suggestion when name changes and url_slug is empty
  useEffect(() => {
    if (babyInfo.name && !babyInfo.url_slug && validationResult.suggestion) {
      setBabyInfo(prev => ({ ...prev, url_slug: validationResult.suggestion }));
    }
  }, [validationResult.suggestion, babyInfo.name, babyInfo.url_slug]);

  const handleUseSuggestion = useCallback(() => {
    if (validationResult.suggestion) {
      setBabyInfo(prev => ({ ...prev, url_slug: validationResult.suggestion }));
    }
  }, [validationResult.suggestion]);

  useEffect(() => {
    loadBabyInfo();
  }, []);

  const loadBabyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('baby_info')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setBabyInfo({
          ...data,
          birth_date: data.birth_date || "",
          birth_place: data.birth_place || "",
          parent1_name: data.parent1_name || "",
          parent2_name: data.parent2_name || "",
          url_slug: data.url_slug || ""
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar informações do bebê:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyInfo.name) {
      toast({
        title: "Erro",
        description: "Nome do bebê é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const updateData = {
        name: babyInfo.name,
        birth_date: babyInfo.birth_date || null,
        is_born: babyInfo.is_born,
        gender: babyInfo.gender,
        birth_place: babyInfo.birth_place || null,
        parent1_name: babyInfo.parent1_name || null,
        parent2_name: babyInfo.parent2_name || null,
        url_slug: babyInfo.url_slug || null
      };

      if (babyInfo.id) {
        const { error } = await supabase
          .from('baby_info')
          .update(updateData)
          .eq('id', babyInfo.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('baby_info')
          .insert({
            ...updateData,
            user_id: user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        setBabyInfo(data);
      }

      toast({
        title: "Sucesso!",
        description: "Informações do bebê salvas com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar informações",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-gradient-to-br from-baby-pink/10 to-baby-blue/10 border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-baby-pink/20 p-4 rounded-full">
              <Heart className="w-8 h-8 text-baby-pink" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Configurações do Bebê</CardTitle>
          <CardDescription>
            Configure as informações principais do seu bebê
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Bebê *</Label>
                <Input
                  id="name"
                  value={babyInfo.name}
                  onChange={(e) => setBabyInfo({...babyInfo, name: e.target.value})}
                  placeholder="Ex: Maria"
                />
              </div>

              <div>
                <Label htmlFor="url_slug">URL Personalizada</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">meusite.com/</span>
                    <div className="relative flex-1">
                      <Input
                        id="url_slug"
                        value={babyInfo.url_slug || ""}
                        onChange={(e) => setBabyInfo({...babyInfo, url_slug: e.target.value})}
                        placeholder="nome-do-bebe"
                        className={`pr-8 ${
                          babyInfo.url_slug && validationResult.isAvailable === true 
                            ? 'border-green-500 focus-visible:ring-green-500' 
                            : babyInfo.url_slug && validationResult.isAvailable === false 
                            ? 'border-red-500 focus-visible:ring-red-500' 
                            : ''
                        }`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {validationResult.isChecking ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : babyInfo.url_slug && validationResult.isAvailable === true ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : babyInfo.url_slug && validationResult.isAvailable === false ? (
                          <X className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                  
                  {/* Availability status */}
                  {babyInfo.url_slug && !validationResult.isChecking && (
                    <div className="text-xs">
                      {validationResult.isAvailable === true ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          URL disponível
                        </span>
                      ) : validationResult.isAvailable === false ? (
                        <span className="text-red-600 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          URL já está em uso
                        </span>
                      ) : null}
                    </div>
                  )}

                  {/* Suggestion */}
                  {validationResult.suggestion && 
                   validationResult.suggestion !== babyInfo.url_slug && 
                   validationResult.isAvailable === false && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                      <Lightbulb className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        Sugestão: 
                      </span>
                      <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">
                        {validationResult.suggestion}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseSuggestion}
                        className="h-6 px-2 text-xs"
                      >
                        Usar
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {babyInfo.name ? 
                      'URL será gerada automaticamente baseada no nome se deixar em branco' :
                      'Digite o nome do bebê para gerar uma sugestão de URL'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Sexo</Label>
                <Select 
                  value={babyInfo.gender} 
                  onValueChange={(value) => setBabyInfo({...babyInfo, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="não_informado">Não informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={babyInfo.birth_date}
                  onChange={(e) => setBabyInfo({...babyInfo, birth_date: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="is_born"
                  checked={babyInfo.is_born}
                  onCheckedChange={(checked) => setBabyInfo({...babyInfo, is_born: checked})}
                />
                <Label htmlFor="is_born">
                  {babyInfo.is_born ? "Já nasceu" : "Previsto para nascer"}
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="birth_place">Local de Nascimento</Label>
              <Input
                id="birth_place"
                value={babyInfo.birth_place}
                onChange={(e) => setBabyInfo({...babyInfo, birth_place: e.target.value})}
                placeholder="Ex: Hospital Santa Casa - São Paulo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parent1_name">Nome do Pai/Mãe 1</Label>
                <Input
                  id="parent1_name"
                  value={babyInfo.parent1_name}
                  onChange={(e) => setBabyInfo({...babyInfo, parent1_name: e.target.value})}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <Label htmlFor="parent2_name">Nome do Pai/Mãe 2</Label>
                <Input
                  id="parent2_name"
                  value={babyInfo.parent2_name}
                  onChange={(e) => setBabyInfo({...babyInfo, parent2_name: e.target.value})}
                  placeholder="Ex: Maria Silva"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-baby-pink"
              disabled={isSubmitting}
            >
              <Baby className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Informações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};