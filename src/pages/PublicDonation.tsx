import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Gift, ArrowLeft, Heart, Baby } from 'lucide-react';
import { toast } from 'sonner';
import InputMask from 'react-input-mask';

interface AgeGroup {
  id: string;
  name: string;
  age_range: string;
  current_quantity: number;
  estimated_quantity: number;
  color_theme: string;
  icon_name: string;
}

interface BabyInfo {
  name: string;
  url_slug: string;
  diaper_groups: AgeGroup[];
}

interface DonationForm {
  age_group_id: string;
  quantity: number;
  donor_name: string;
  donor_contact: string;
  donor_email: string;
  notes: string;
}

const PublicDonation = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [babyInfo, setBabyInfo] = useState<BabyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [donationForm, setDonationForm] = useState<DonationForm>({
    age_group_id: '',
    quantity: 0,
    donor_name: '',
    donor_contact: '',
    donor_email: '',
    notes: ''
  });

  useEffect(() => {
    const fetchBabyInfo = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_baby_profile_by_slug', {
          baby_slug: slug
        });

        if (error) throw error;

        if (!data || data.length === 0) {
          setNotFound(true);
        } else {
          const profile = data[0];
          console.log('Profile data received:', profile);
          
          let diaperGroups: AgeGroup[] = [];
          if (profile.diaper_groups) {
            try {
              diaperGroups = typeof profile.diaper_groups === 'string' 
                ? JSON.parse(profile.diaper_groups)
                : profile.diaper_groups;
              
              console.log('Parsed diaper groups:', diaperGroups);
              
              // Verificar se todos os grupos têm IDs válidos
              diaperGroups.forEach((group, index) => {
                console.log(`Group ${index}:`, group);
                if (!group.id) {
                  console.error(`Group at index ${index} has no ID:`, group);
                }
              });
            } catch (e) {
              console.warn('Failed to parse diaper_groups:', e);
              diaperGroups = [];
            }
          }
          
          setBabyInfo({
            name: profile.name,
            url_slug: profile.url_slug,
            diaper_groups: diaperGroups
          });
        }
      } catch (error: any) {
        console.error('Erro ao buscar dados:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBabyInfo();
  }, [slug]);

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data before validation:', donationForm);
    console.log('Selected age_group_id:', donationForm.age_group_id);
    console.log('Available groups:', babyInfo?.diaper_groups);
    
    if (!donationForm.age_group_id || donationForm.quantity <= 0 || !donationForm.donor_name) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se age_group_id é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(donationForm.age_group_id)) {
      console.error('Invalid UUID:', donationForm.age_group_id);
      toast.error('Erro: ID do grupo etário inválido');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Inserting donation with data:', {
        age_group_id: donationForm.age_group_id,
        quantity: donationForm.quantity,
        donor_name: donationForm.donor_name,
        donor_contact: donationForm.donor_contact,
        donor_email: donationForm.donor_email,
        notes: donationForm.notes,
        created_by: null
      });

      const { error } = await supabase
        .from('diaper_donations')
        .insert({
          age_group_id: donationForm.age_group_id,
          quantity: donationForm.quantity,
          donor_name: donationForm.donor_name,
          donor_contact: donationForm.donor_contact,
          donor_email: donationForm.donor_email,
          notes: donationForm.notes,
          created_by: null // Doação pública, sem usuário autenticado
        });

      if (error) throw error;

      toast.success('Doação registrada com sucesso! Muito obrigado pela sua generosidade!');
      setDonationForm({
        age_group_id: '',
        quantity: 0,
        donor_name: '',
        donor_contact: '',
        donor_email: '',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error inserting donation:', error);
      toast.error('Erro ao registrar doação: ' + error.message);
    } finally {
      setSubmitting(false);
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

  if (notFound || !babyInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="card-baby p-8 text-center max-w-md">
          <Baby className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">
            Perfil não encontrado
          </h2>
          <p className="text-muted-foreground">
            Não conseguimos encontrar o perfil do bebê solicitado.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-baby-blue p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-10 h-10 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
            Fazer uma Doação
          </h1>
          <p className="text-muted-foreground mb-2">
            Ajude o(a) {babyInfo.name} doando fraldas
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/${slug}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver Perfil Completo
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="card-baby">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Gift className="w-5 h-5" />
                Formulário de Doação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDonation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donation-age-group">Faixa Etária *</Label>
                    <select
                      id="donation-age-group"
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      value={donationForm.age_group_id}
                      onChange={(e) => setDonationForm({ ...donationForm, age_group_id: e.target.value })}
                      required
                    >
                      <option value="">Selecione uma faixa etária...</option>
                      {babyInfo.diaper_groups.map((group) => {
                        const needed = Math.max(0, group.estimated_quantity - group.current_quantity);
                        return (
                          <option key={group.id} value={group.id}>
                            {group.name} ({group.age_range}) - {needed > 0 ? `Precisa de ${needed}` : 'Meta atingida'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="donation-quantity">Quantidade *</Label>
                    <Input
                      id="donation-quantity"
                      type="number"
                      value={donationForm.quantity || ''}
                      onChange={(e) => setDonationForm({ ...donationForm, quantity: parseInt(e.target.value) || 0 })}
                      required
                      min="1"
                      placeholder="Ex: 20"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="donor-name">Seu Nome *</Label>
                  <Input
                    id="donor-name"
                    value={donationForm.donor_name}
                    onChange={(e) => setDonationForm({ ...donationForm, donor_name: e.target.value })}
                    placeholder="Como você gostaria de ser reconhecido"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donor-email">Seu Email</Label>
                    <Input
                      id="donor-email"
                      type="email"
                      value={donationForm.donor_email}
                      onChange={(e) => setDonationForm({ ...donationForm, donor_email: e.target.value })}
                      placeholder="exemplo@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-contact">Seu Telefone</Label>
                    <InputMask
                      mask="(99) 99999-9999"
                      value={donationForm.donor_contact}
                      onChange={(e) => setDonationForm({ ...donationForm, donor_contact: e.target.value })}
                    >
                      {(inputProps) => (
                        <Input
                          {...inputProps}
                          id="donor-contact"
                          placeholder="(11) 99999-9999"
                        />
                      )}
                    </InputMask>
                  </div>
                </div>

                <div>
                  <Label htmlFor="donation-notes">Mensagem (Opcional)</Label>
                  <Textarea
                    id="donation-notes"
                    placeholder="Deixe uma mensagem carinhosa ou informações sobre a doação..."
                    value={donationForm.notes}
                    onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-baby-mint"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
                      Registrando...
                    </div>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Confirmar Doação
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info sobre necessidades */}
          {babyInfo.diaper_groups.length > 0 && (
            <Card className="card-baby mt-6">
              <CardHeader>
                <CardTitle className="text-center">Necessidades Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {babyInfo.diaper_groups.map((group) => {
                    const needed = Math.max(0, group.estimated_quantity - group.current_quantity);
                    const isComplete = needed === 0;
                    
                    return (
                      <div key={group.id} className="p-4 bg-background/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{group.name}</span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            isComplete ? 'bg-baby-mint text-foreground' : 'bg-baby-yellow text-foreground'
                          }`}>
                            {isComplete ? '✓ Meta atingida' : `Faltam ${needed}`}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {group.age_range} • {group.current_quantity}/{group.estimated_quantity} fraldas
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicDonation;