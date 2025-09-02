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
import { Settings, Package, Gift, User, BarChart3, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Reports } from '@/components/Reports';

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

interface PurchaseForm {
  age_group_id: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  store_name: string;
  notes: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgeGroups, setEditingAgeGroups] = useState<{[key: string]: AgeGroup}>({});
  const [editingStocks, setEditingStocks] = useState<{[key: string]: number}>({});
  const [donationForm, setDonationForm] = useState<DonationForm>({
    age_group_id: '',
    quantity: 0,
    donor_name: '',
    donor_contact: '',
    notes: ''
  });
  
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
    
    fetchData();

    // Setup real-time subscriptions
    const ageGroupsChannel = supabase
      .channel('admin-age-groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diaper_age_groups'
        },
        (payload) => {
          console.log('Age groups changed:', payload);
          // Use callback to get current state
          setEditingAgeGroups(currentEditing => {
            // Only refetch if we're not currently editing to avoid conflicts
            if (Object.keys(currentEditing).length === 0) {
              fetchData();
            }
            return currentEditing;
          });
        }
      )
      .subscribe();

    const stockChannel = supabase
      .channel('admin-stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diaper_stock'
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ageGroupsChannel);
      supabase.removeChannel(stockChannel);
    };
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

      toast.success('Doação registrada com sucesso! Estoque atualizado automaticamente.');
      setDonationForm({
        age_group_id: '',
        quantity: 0,
        donor_name: '',
        donor_contact: '',
        notes: ''
      });
      // Não precisamos chamar fetchData() pois o trigger atualiza o estoque automaticamente
    } catch (error: any) {
      toast.error('Erro ao registrar doação: ' + error.message);
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
      // Não precisamos chamar fetchData() pois o trigger atualiza o estoque automaticamente
    } catch (error: any) {
      toast.error('Erro ao registrar compra: ' + error.message);
    }
  };

  const handleUpdateAgeGroup = async (ageGroupId: string, updatedData: Partial<AgeGroup>) => {
    try {
      const { error } = await supabase
        .from('diaper_age_groups')
        .update(updatedData)
        .eq('id', ageGroupId);

      if (error) throw error;

      // Update local state immediately to prevent flicker
      setAgeGroups(prev => prev.map(group => 
        group.id === ageGroupId 
          ? { ...group, ...updatedData }
          : group
      ));

      // Remove from editing state
      setEditingAgeGroups(prev => {
        const newState = { ...prev };
        delete newState[ageGroupId];
        return newState;
      });

      toast.success('Configuração atualizada com sucesso!');
      
      // No need to call fetchData() - real-time subscription will handle it
    } catch (error: any) {
      toast.error('Erro ao atualizar configuração: ' + error.message);
    }
  };

  const startEditing = (ageGroup: AgeGroup) => {
    setEditingAgeGroups(prev => ({
      ...prev,
      [ageGroup.id]: { ...ageGroup }
    }));
  };

  const cancelEditing = (ageGroupId: string) => {
    setEditingAgeGroups(prev => {
      const newState = { ...prev };
      delete newState[ageGroupId];
      return newState;
    });
  };

  const updateEditingAgeGroup = (ageGroupId: string, field: keyof AgeGroup, value: string | number) => {
    setEditingAgeGroups(prev => ({
      ...prev,
      [ageGroupId]: {
        ...prev[ageGroupId],
        [field]: value
      }
    }));
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
    <div className="bg-background">
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
          </div>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Controle de Estoque
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Registrar Doação
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Registrar Compra
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Reports />
          </TabsContent>

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
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Quantidade:</Label>
                          <Input
                            type="number"
                            value={editingStocks[stock?.id || ''] !== undefined 
                              ? editingStocks[stock?.id || ''] 
                              : (stock?.current_quantity || 0)}
                            onChange={(e) => {
                              if (stock) {
                                setEditingStocks(prev => ({
                                  ...prev,
                                  [stock.id]: parseInt(e.target.value) || 0
                                }));
                              }
                            }}
                            className="flex-1"
                            min="0"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (stock && editingStocks[stock.id] !== undefined) {
                                handleUpdateStock(stock.id, editingStocks[stock.id]);
                                setEditingStocks(prev => {
                                  const newState = { ...prev };
                                  delete newState[stock.id];
                                  return newState;
                                });
                              }
                            }}
                            disabled={!stock || editingStocks[stock?.id || ''] === undefined}
                            className="btn-baby-mint"
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (stock) {
                                setEditingStocks(prev => {
                                  const newState = { ...prev };
                                  delete newState[stock.id];
                                  return newState;
                                });
                              }
                            }}
                            disabled={!stock || editingStocks[stock?.id || ''] === undefined}
                          >
                            Cancelar
                          </Button>
                        </div>
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

          <TabsContent value="purchases" className="space-y-6">
            <Card className="card-baby p-6">
              <h2 className="text-xl font-semibold font-heading text-foreground mb-4">
                Registrar Nova Compra
              </h2>
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
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="card-baby p-6">
              <h2 className="text-xl font-semibold font-heading text-foreground mb-4">
                Configurações das Faixas Etárias
              </h2>
              <div className="space-y-4">
                {ageGroups.map((group) => {
                  const isEditing = editingAgeGroups[group.id];
                  const currentData = isEditing || group;
                  
                  return (
                    <div key={group.id} className="border border-border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label>Nome</Label>
                          <Input 
                            value={currentData.name} 
                            readOnly={!isEditing}
                            onChange={(e) => isEditing && updateEditingAgeGroup(group.id, 'name', e.target.value)}
                            className={isEditing ? 'border-primary' : ''}
                          />
                        </div>
                        <div>
                          <Label>Faixa Etária</Label>
                          <Input 
                            value={currentData.age_range} 
                            readOnly={!isEditing}
                            onChange={(e) => isEditing && updateEditingAgeGroup(group.id, 'age_range', e.target.value)}
                            className={isEditing ? 'border-primary' : ''}
                          />
                        </div>
                        <div>
                          <Label>Meta Estimada</Label>
                          <Input 
                            type="number" 
                            value={currentData.estimated_quantity} 
                            readOnly={!isEditing}
                            onChange={(e) => isEditing && updateEditingAgeGroup(group.id, 'estimated_quantity', parseInt(e.target.value) || 0)}
                            className={isEditing ? 'border-primary' : ''}
                          />
                        </div>
                        <div>
                          <Label>Preço Unitário (R$)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={currentData.price_per_unit} 
                            readOnly={!isEditing}
                            onChange={(e) => isEditing && updateEditingAgeGroup(group.id, 'price_per_unit', parseFloat(e.target.value) || 0)}
                            className={isEditing ? 'border-primary' : ''}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        {!isEditing ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startEditing(group)}
                            className="btn-baby-blue"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => cancelEditing(group.id)}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateAgeGroup(group.id, {
                                name: currentData.name,
                                age_range: currentData.age_range,
                                estimated_quantity: currentData.estimated_quantity,
                                price_per_unit: currentData.price_per_unit
                              })}
                              className="btn-baby-green"
                            >
                              Salvar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;