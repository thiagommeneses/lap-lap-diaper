import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Type, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PageSettings {
  id?: string;
  title: string;
  subtitle: string;
  welcome_message: string;
}

export const PageSettingsConfig = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<PageSettings>({
    title: "",
    subtitle: "",
    welcome_message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPageSettings();
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
          id: data.id,
          title: data.title || "",
          subtitle: data.subtitle || "",
          welcome_message: data.welcome_message || ""
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.title) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (settings.id) {
        const { error } = await supabase
          .from("page_settings")
          .update({
            title: settings.title,
            subtitle: settings.subtitle,
            welcome_message: settings.welcome_message
          })
          .eq("id", settings.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("page_settings")
          .insert({
            title: settings.title,
            subtitle: settings.subtitle,
            welcome_message: settings.welcome_message,
            user_id: user?.id
          })
          .select()
          .single();
        
        if (error) throw error;
        setSettings({...settings, id: data.id});
      }

      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-gradient-to-br from-baby-purple/10 to-baby-blue/10 border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-baby-purple/20 p-4 rounded-full">
              <Type className="w-8 h-8 text-baby-purple" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Configurações de Texto</CardTitle>
          <CardDescription>
            Personalize o título, subtítulo e mensagens da página inicial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Título Principal *</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => setSettings({...settings, title: e.target.value})}
                placeholder="Ex: Lap Lap Diaper"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este será o título principal exibido no cabeçalho
              </p>
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Textarea
                id="subtitle"
                value={settings.subtitle}
                onChange={(e) => setSettings({...settings, subtitle: e.target.value})}
                placeholder="Ex: Acompanhe o estoque e o consumo de fraldas do seu bebê de forma simples e organizada"
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Descrição que aparece abaixo do título principal
              </p>
            </div>

            <div>
              <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcome_message"
                value={settings.welcome_message}
                onChange={(e) => setSettings({...settings, welcome_message: e.target.value})}
                placeholder="Ex: Bem-vindo ao sistema de controle de fraldas"
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mensagem opcional para dar as boas-vindas aos usuários
              </p>
            </div>

            <div className="bg-baby-cream/50 p-4 rounded-lg border border-border/50">
              <h3 className="font-medium text-foreground mb-2">Prévia:</h3>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold font-heading text-foreground">
                  {settings.title || "Título Principal"}
                </h1>
                {settings.subtitle && (
                  <p className="text-muted-foreground">
                    {settings.subtitle}
                  </p>
                )}
                {settings.welcome_message && (
                  <p className="text-sm text-baby-blue font-medium">
                    {settings.welcome_message}
                  </p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-baby-purple"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};