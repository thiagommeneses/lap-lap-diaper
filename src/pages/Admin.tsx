import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Package, Gift, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

interface AgeGroup {
  id: string;
  name: string;
  age_range: string;
  estimated_quantity: number;
  price_per_unit: number;
  color_theme: string;
  icon_name: string;
}

interface Stock {
  id: string;
  age_group_id: string;
  current_quantity: number;
  notes?: string;
}

interface DonationForm {
  age_group_id: string;
  quantity: number;
  donor_name: string;
  donor_contact: string;
  notes: string;
}

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationForm, setDonationForm] = useState<DonationForm>({
    age_group_id: '',
    quantity: 0,
    donor_name: '',
    donor_contact: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const { data: ageGroupsData, error: ageGroupsError } = await supabase
        .from('diaper_age_groups')
        .select('*')
        .order('created_at');

      if (ageGroupsError) throw ageGroupsError;

      const { data: stocksData, error: stocksError } = await supabase
        .from('diaper_stock')
        .select('*');

      if (stocksError) throw stocksError;

      setAgeGroups(ageGroupsData || []);
      setStocks(stocksData || []);
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (stockId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('diaper_stock')
        .update({ 
          current_quantity: newQuantity,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', stockId);

      if (error) throw error;

      toast.success('Estoque atualizado com sucesso!');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao atualizar estoque: ' + error.message);
    }
  };

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationForm.age_group_id || donationForm.quantity <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase
        .from('diaper_donations')
        .insert({
          age_group_id: donationForm.age_group_id,
          quantity: donationForm.quantity,
          donor_name: donationForm.donor_name,
          donor_contact: donationForm.donor_contact,
          notes: donationForm.notes,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Doação registrada com sucesso!');
      setDonationForm({
        age_group_id: '',
        quantity: 0,
        donor_name: '',
        donor_contact: '',
        notes: ''
      });
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao registrar doação: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Logout realizado com sucesso!');
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie o estoque e doações de fraldas</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-baby-mint text-foreground">
              <User className="w-4 h-4 mr-1" />
              {user?.email}
            </Badge>
            <Button variant="outline" onClick={() => navigate('/')}>
              ← Dashboard
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Controle de Estoque
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Registrar Doação
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-6">
            <Card className="card-baby p-6">
              <h2 className="text-xl font-semibold font-heading text-foreground mb-4">
                Atualizar Estoque
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ageGroups.map((group) => {
                  const stock = stocks.find(s => s.age_group_id === group.id);
                  return (
                    <div key={group.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-foreground">{group.name}</h3>
                        <Badge variant="secondary" className="bg-baby-blue text-foreground">
                          {group.age_range}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Quantidade:</Label>
                        <Input
                          type="number"
                          value={stock?.current_quantity || 0}
                          onChange={(e) => {
                            if (stock) {
                              handleUpdateStock(stock.id, parseInt(e.target.value) || 0);
                            }
                          }}
                          className="flex-1"
                          min="0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <Card className="card-baby p-6">
              <h2 className="text-xl font-semibold font-heading text-foreground mb-4">
                Registrar Nova Doação
              </h2>
              <form onSubmit={handleDonation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age-group">Faixa Etária *</Label>
                    <select
                      id="age-group"
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      value={donationForm.age_group_id}
                      onChange={(e) => setDonationForm({ ...donationForm, age_group_id: e.target.value })}
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
                    <Label htmlFor="quantity">Quantidade *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={donationForm.quantity}
                      onChange={(e) => setDonationForm({ ...donationForm, quantity: parseInt(e.target.value) || 0 })}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donor-name">Nome do Doador</Label>
                    <Input
                      id="donor-name"
                      value={donationForm.donor_name}
                      onChange={(e) => setDonationForm({ ...donationForm, donor_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-contact">Contato do Doador</Label>
                    <Input
                      id="donor-contact"
                      value={donationForm.donor_contact}
                      onChange={(e) => setDonationForm({ ...donationForm, donor_contact: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ex: marca, condições especiais, etc."
                    value={donationForm.notes}
                    onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                  />
                </div>

                <Button type="submit" className="btn-baby-mint">
                  <Gift className="w-4 h-4 mr-2" />
                  Registrar Doação
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="card-baby p-6">
              <h2 className="text-xl font-semibold font-heading text-foreground mb-4">
                Configurações das Faixas Etárias
              </h2>
              <div className="space-y-4">
                {ageGroups.map((group) => (
                  <div key={group.id} className="border border-border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <Input value={group.name} readOnly />
                      </div>
                      <div>
                        <Label>Faixa Etária</Label>
                        <Input value={group.age_range} readOnly />
                      </div>
                      <div>
                        <Label>Meta Estimada</Label>
                        <Input type="number" value={group.estimated_quantity} readOnly />
                      </div>
                      <div>
                        <Label>Preço Unitário</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={group.price_per_unit} 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;