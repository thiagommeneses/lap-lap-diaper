import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AgeGroup {
  id: string;
  name: string;
  age_range: string;
}

interface PurchaseForm {
  age_group_id: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  store_name: string;
  notes: string;
}

const RegisterPurchase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({
    age_group_id: '',
    quantity: 0,
    unit_price: 0,
    total_cost: 0,
    store_name: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchAgeGroups();
  }, [user, navigate]);

  const fetchAgeGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('diaper_age_groups')
        .select('id, name, age_range')
        .order('created_at');

      if (error) throw error;
      setAgeGroups(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar faixas etárias: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!purchaseForm.age_group_id || purchaseForm.quantity <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase
        .from('diaper_purchases')
        .insert({
          age_group_id: purchaseForm.age_group_id,
          quantity: purchaseForm.quantity,
          unit_price: purchaseForm.unit_price,
          total_cost: purchaseForm.total_cost,
          store_name: purchaseForm.store_name,
          notes: purchaseForm.notes,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Compra registrada com sucesso! Estoque atualizado automaticamente.');
      setPurchaseForm({
        age_group_id: '',
        quantity: 0,
        unit_price: 0,
        total_cost: 0,
        store_name: '',
        notes: ''
      });
    } catch (error: any) {
      toast.error('Erro ao registrar compra: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground">Registrar Compra</h1>
            <p className="text-muted-foreground">Registre uma nova compra de fraldas</p>
          </div>
        </div>

        <Card className="card-baby p-6 max-w-2xl">
          <form onSubmit={handlePurchase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchase-age-group">Faixa Etária *</Label>
                <select
                  id="purchase-age-group"
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                  value={purchaseForm.age_group_id}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, age_group_id: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {ageGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.age_range})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="purchase-quantity">Quantidade *</Label>
                <Input
                  id="purchase-quantity"
                  type="number"
                  value={purchaseForm.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 0;
                    setPurchaseForm({ 
                      ...purchaseForm, 
                      quantity: qty,
                      total_cost: qty * purchaseForm.unit_price
                    });
                  }}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="unit-price">Preço Unitário (R$)</Label>
                <Input
                  id="unit-price"
                  type="number"
                  step="0.01"
                  value={purchaseForm.unit_price}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    setPurchaseForm({ 
                      ...purchaseForm, 
                      unit_price: price,
                      total_cost: purchaseForm.quantity * price
                    });
                  }}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="total-cost">Total (R$)</Label>
                <Input
                  id="total-cost"
                  type="number"
                  step="0.01"
                  value={purchaseForm.total_cost}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, total_cost: parseFloat(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="store-name">Loja/Fornecedor</Label>
                <Input
                  id="store-name"
                  value={purchaseForm.store_name}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, store_name: e.target.value })}
                  placeholder="Ex: Farmácia ABC"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purchase-notes">Observações</Label>
              <Textarea
                id="purchase-notes"
                placeholder="Ex: marca, desconto aplicado, etc."
                value={purchaseForm.notes}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
              />
            </div>

            <Button type="submit" className="btn-baby-blue">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Registrar Compra
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPurchase;