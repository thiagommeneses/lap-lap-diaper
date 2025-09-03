import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PendingDonation {
  id: string;
  quantity: number;
  donor_name: string | null;
  donor_email: string | null;
  donor_contact: string | null;
  notes: string | null;
  donation_date: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  age_group: {
    name: string;
    color_theme: string;
  };
}

export const PendingDonations = () => {
  const [donations, setDonations] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('diaper_donations')
        .select(`
          id,
          quantity,
          donor_name,
          donor_email,
          donor_contact,
          notes,
          donation_date,
          created_at,
          status,
          age_group:diaper_age_groups!inner(name, color_theme)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations((data || []) as PendingDonation[]);
    } catch (error) {
      console.error('Erro ao buscar doações pendentes:', error);
      toast.error('Erro ao carregar doações pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (donationId: string) => {
    setProcessingId(donationId);
    try {
      const { error } = await supabase.rpc('approve_donation', {
        donation_id: donationId
      });

      if (error) throw error;
      
      toast.success('Doação aprovada com sucesso!');
      fetchPendingDonations();
    } catch (error) {
      console.error('Erro ao aprovar doação:', error);
      toast.error('Erro ao aprovar doação');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (donationId: string) => {
    setProcessingId(donationId);
    try {
      const { error } = await supabase.rpc('reject_donation', {
        donation_id: donationId
      });

      if (error) throw error;
      
      toast.success('Doação rejeitada');
      fetchPendingDonations();
    } catch (error) {
      console.error('Erro ao rejeitar doação:', error);
      toast.error('Erro ao rejeitar doação');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchPendingDonations();

    // Inscrever-se para mudanças em tempo real
    const subscription = supabase
      .channel('donations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'diaper_donations' },
        () => fetchPendingDonations()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Doações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (donations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Doações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma doação pendente de aprovação.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Doações Pendentes
          <Badge variant="secondary">{donations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: `hsl(var(--${donation.age_group.color_theme}))`,
                    color: `hsl(var(--${donation.age_group.color_theme}))`
                  }}
                >
                  {donation.age_group.name}
                </Badge>
                <span className="font-semibold">
                  {donation.quantity} {donation.quantity === 1 ? 'fralda' : 'fraldas'}
                </span>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(donation.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </Badge>
            </div>

            {donation.donor_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{donation.donor_name}</span>
              </div>
            )}

            {donation.donor_email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{donation.donor_email}</span>
              </div>
            )}

            {donation.donor_contact && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{donation.donor_contact}</span>
              </div>
            )}

            {donation.notes && (
              <div className="text-sm text-muted-foreground">
                <strong>Observações:</strong> {donation.notes}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleApprove(donation.id)}
                disabled={processingId === donation.id}
                size="sm"
                className="flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                {processingId === donation.id ? 'Aprovando...' : 'Aprovar'}
              </Button>
              <Button
                onClick={() => handleReject(donation.id)}
                disabled={processingId === donation.id}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                {processingId === donation.id ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};