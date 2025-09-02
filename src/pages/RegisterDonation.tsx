import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Gift, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import InputMask from 'react-input-mask';
import { useAdmin } from '@/hooks/useAdmin';

interface AgeGroup {
  id: string;
  name: string;
  age_range: string;
}

interface DonationForm {
  age_group_id: string;
  quantity: number;
  donor_name: string;
  donor_contact: string;
  donor_email: string;
  notes: string;
}

const RegisterDonation = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationForm, setDonationForm] = useState<DonationForm>({
    age_group_id: '',
    quantity: 0,
    donor_name: '',
    donor_contact: '',
    donor_email: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!adminLoading && !isAdmin) {
      // Usuário não é admin, não pode registrar doações
      setLoading(false);
      return;
    }
    
    if (isAdmin) {
      fetchAgeGroups();
    }
  }, [user, navigate, isAdmin, adminLoading]);

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
          donor_email: donationForm.donor_email,
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
        donor_email: '',
        notes: ''
      });
    } catch (error: any) {
      toast.error('Erro ao registrar doação: ' + error.message);
    }
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não é admin, mostrar mensagem de acesso negado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
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
          </div>
          
          <Alert className="max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Acesso restrito: Apenas administradores podem registrar doações. 
              Entre em contato com o administrador do sistema para solicitar permissões.
            </AlertDescription>
          </Alert>
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
            <h1 className="text-3xl font-bold font-heading text-foreground">Registrar Doação</h1>
            <p className="text-muted-foreground">Registre uma nova doação de fraldas</p>
          </div>
        </div>

        <Card className="card-baby p-6 max-w-2xl">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="donor-name">Nome do Doador</Label>
                <Input
                  id="donor-name"
                  value={donationForm.donor_name}
                  onChange={(e) => setDonationForm({ ...donationForm, donor_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="donor-email">Email do Doador</Label>
                <Input
                  id="donor-email"
                  type="email"
                  value={donationForm.donor_email}
                  onChange={(e) => setDonationForm({ ...donationForm, donor_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="donor-contact">Contato do Doador</Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={donationForm.donor_contact}
                  onChange={(e) => setDonationForm({ ...donationForm, donor_contact: e.target.value })}
                >
                  <Input
                    id="donor-contact"
                    placeholder="(11) 99999-9999"
                  />
                </InputMask>
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
      </div>
    </div>
  );
};

export default RegisterDonation;