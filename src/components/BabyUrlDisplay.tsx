import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Share2 } from "lucide-react";
import { useBabyUrl } from "@/hooks/useBabyUrl";
import { toast } from 'sonner';

export const BabyUrlDisplay = () => {
  const { babyUrl, loading } = useBabyUrl();

  if (loading) {
    return (
      <Card className="card-baby p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-background/50 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-background/50 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!babyUrl.full_url) {
    return (
      <Card className="card-baby p-4">
        <div className="text-center">
          <Share2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Configure o nome do bebê para gerar sua URL personalizada
          </p>
        </div>
      </Card>
    );
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(babyUrl.full_url!);
      toast.success('URL copiada para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar URL');
    }
  };

  const openInNewTab = () => {
    window.open(babyUrl.full_url!, '_blank');
  };

  return (
    <Card className="card-baby p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">URL Personalizada</h3>
          <p className="text-sm text-muted-foreground">
            Compartilhe com familiares e doadores
          </p>
        </div>
        <Badge variant="secondary" className="bg-baby-mint/20 text-foreground">
          {babyUrl.baby_name}
        </Badge>
      </div>
      
      <div className="bg-background/50 p-3 rounded-lg mb-4">
        <p className="text-sm font-mono text-foreground break-all">
          {babyUrl.full_url}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copyToClipboard}
          className="flex-1"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openInNewTab}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir
        </Button>
      </div>
    </Card>
  );
};