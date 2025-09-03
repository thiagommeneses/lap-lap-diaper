import { useState, useEffect } from 'react';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useReminders } from '@/hooks/useReminders';
import { useDiaperData } from '@/hooks/useDiaperData';
import { toast } from 'sonner';

const ReminderSettings = () => {
  const { createReminder } = useReminders();
  const { ageGroups } = useDiaperData();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    reminder_type: 'low_stock' as 'low_stock' | 'restock' | 'donation_check',
    age_group_id: '',
    title: '',
    message: '',
    threshold_quantity: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    await createReminder({
      reminder_type: formData.reminder_type,
      age_group_id: formData.age_group_id || undefined,
      title: formData.title,
      message: formData.message,
      threshold_quantity: formData.reminder_type === 'low_stock' 
        ? formData.threshold_quantity 
        : undefined
    });

    setFormData({
      reminder_type: 'low_stock',
      age_group_id: '',
      title: '',
      message: '',
      threshold_quantity: 50
    });
    setIsOpen(false);
  };

  const generateDefaultMessage = () => {
    const selectedGroup = ageGroups.find(group => group.id === formData.age_group_id);
    const groupName = selectedGroup ? selectedGroup.name : 'fraldas';
    
    switch (formData.reminder_type) {
      case 'low_stock':
        return `O estoque de ${groupName} está baixo. É hora de fazer uma reposição.`;
      case 'restock':
        return `Lembrete para verificar e repor o estoque de ${groupName}.`;
      case 'donation_check':
        return `Verificar se há doações pendentes para processar.`;
      default:
        return '';
    }
  };

  useEffect(() => {
    if (formData.reminder_type && (formData.age_group_id || formData.reminder_type === 'donation_check')) {
      const defaultMessage = generateDefaultMessage();
      setFormData(prev => ({ ...prev, message: defaultMessage }));
    }
  }, [formData.reminder_type, formData.age_group_id]);

  const createQuickReminders = async () => {
    for (const ageGroup of ageGroups) {
      await createReminder({
        reminder_type: 'low_stock',
        age_group_id: ageGroup.id,
        title: `Estoque Baixo - ${ageGroup.name}`,
        message: `O estoque de fraldas ${ageGroup.name} está baixo. É hora de fazer uma reposição.`,
        threshold_quantity: 50
      });
    }
    toast.success('Lembretes automáticos criados para todos os grupos');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar Lembretes
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={createQuickReminders}
              className="text-xs"
            >
              Criar Automáticos
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Lembrete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Lembrete</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="reminder_type">Tipo de Lembrete</Label>
                    <Select 
                      value={formData.reminder_type} 
                      onValueChange={(value) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          reminder_type: value as any,
                          title: value === 'low_stock' ? 'Estoque Baixo' :
                                 value === 'restock' ? 'Reposição' :
                                 'Verificar Doações'
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                        <SelectItem value="restock">Reposição</SelectItem>
                        <SelectItem value="donation_check">Verificar Doações</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.reminder_type !== 'donation_check' && (
                    <div>
                      <Label htmlFor="age_group_id">Grupo de Idade (Opcional)</Label>
                      <Select 
                        value={formData.age_group_id} 
                        onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, age_group_id: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({group.age_range})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do lembrete"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Digite a mensagem do lembrete"
                      rows={3}
                    />
                  </div>

                  {formData.reminder_type === 'low_stock' && (
                    <div>
                      <Label htmlFor="threshold_quantity">Quantidade Limite</Label>
                      <Input
                        id="threshold_quantity"
                        type="number"
                        value={formData.threshold_quantity}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          threshold_quantity: parseInt(e.target.value) || 0 
                        }))}
                        placeholder="50"
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lembrete será ativado quando o estoque ficar igual ou abaixo deste valor
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Lembrete
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Configure lembretes personalizados para:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Estoque Baixo:</strong> Alertas quando o estoque de um grupo específico ficar abaixo do limite</li>
            <li><strong>Reposição:</strong> Lembretes periódicos para verificar e repor estoque</li>
            <li><strong>Verificar Doações:</strong> Lembretes para processar doações pendentes</li>
          </ul>
          <p className="mt-3 text-xs">
            Use "Criar Automáticos" para configurar rapidamente lembretes de estoque baixo para todos os grupos de idade.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderSettings;