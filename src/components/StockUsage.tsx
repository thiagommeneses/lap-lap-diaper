import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDiaperData } from "@/hooks/useDiaperData";

export const StockUsage = () => {
  const { ageGroups, refetch } = useDiaperData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    age_group_id: "",
    quantity: "",
    notes: "",
    usage_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.age_group_id || !formData.quantity) {
      toast({
        title: "Erro",
        description: "Selecione a faixa etária e quantidade",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('diaper_usage')
        .insert({
          age_group_id: formData.age_group_id,
          quantity: parseInt(formData.quantity),
          notes: formData.notes || null,
          usage_date: formData.usage_date,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Consumo de ${formData.quantity} fraldas registrado`
      });

      setFormData({
        age_group_id: "",
        quantity: "",
        notes: "",
        usage_date: new Date().toISOString().split('T')[0]
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar consumo",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-gradient-to-br from-baby-blue/10 to-baby-pink/10 border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-baby-orange/20 p-4 rounded-full">
              <Minus className="w-8 h-8 text-baby-orange" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Registrar Consumo</CardTitle>
          <CardDescription>
            Registre o uso de fraldas para reduzir do estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age_group">Faixa Etária *</Label>
                <Select 
                  value={formData.age_group_id} 
                  onValueChange={(value) => setFormData({...formData, age_group_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a faixa etária" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} - {group.age_range} (Estoque: {group.current_quantity || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantidade Usada *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="Ex: 5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="usage_date">Data do Uso</Label>
              <Input
                id="usage_date"
                type="date"
                value={formData.usage_date}
                onChange={(e) => setFormData({...formData, usage_date: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ex: Troca da manhã, vazamento..."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full btn-baby-orange"
              disabled={isSubmitting}
            >
              <Package className="w-4 h-4 mr-2" />
              {isSubmitting ? "Registrando..." : "Registrar Consumo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};