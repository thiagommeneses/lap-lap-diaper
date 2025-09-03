import { useState } from 'react';
import { Bell, AlertTriangle, Package, Calendar, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useReminders } from '@/hooks/useReminders';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RemindersPanel = () => {
  const { reminders, loading, unreadCount, markAsRead, updateReminder, deleteReminder } = useReminders();
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', message: '', threshold_quantity: 0 });

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'restock':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'donation_check':
        return <Calendar className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'Estoque Baixo';
      case 'restock':
        return 'Reposição';
      case 'donation_check':
        return 'Verificar Doações';
      default:
        return 'Lembrete';
    }
  };

  const unreadReminders = reminders.filter(r => !r.is_read);
  const readReminders = reminders.filter(r => r.is_read);

  const handleEditReminder = (reminder: any) => {
    setEditingReminder(reminder);
    setEditForm({
      title: reminder.title,
      message: reminder.message,
      threshold_quantity: reminder.threshold_quantity || 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editingReminder) return;
    
    await updateReminder(editingReminder.id, {
      title: editForm.title,
      message: editForm.message,
      threshold_quantity: editForm.threshold_quantity || undefined
    });
    
    setEditingReminder(null);
    setEditForm({ title: '', message: '', threshold_quantity: 0 });
  };

  const handleDeleteReminder = async (reminderId: string) => {
    await deleteReminder(reminderId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Lembretes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderReminderCard = (reminder: any) => (
    <div key={reminder.id} className="space-y-3">
      <div 
        className={`p-3 rounded-lg border transition-colors ${
          reminder.is_read 
            ? 'bg-muted/30 border-border' 
            : 'bg-accent/50 border-accent'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            {getIcon(reminder.reminder_type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(reminder.reminder_type)}
                </Badge>
                {reminder.age_group_name && (
                  <Badge variant="secondary" className="text-xs">
                    {reminder.age_group_name}
                  </Badge>
                )}
              </div>
              <h4 className="font-medium text-sm mb-1">
                {reminder.title}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {reminder.message}
              </p>
              {reminder.reminder_type === 'low_stock' && (
                <p className="text-xs text-muted-foreground">
                  Estoque atual: {reminder.current_stock} unidades
                  {reminder.threshold_quantity && (
                    <> (limite: {reminder.threshold_quantity})</>
                  )}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {reminder.triggered_at 
                  ? formatDistanceToNow(new Date(reminder.triggered_at), {
                      addSuffix: true,
                      locale: ptBR
                    })
                  : formatDistanceToNow(new Date(reminder.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Botão Editar */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditReminder(reminder)}
                  className="text-xs h-6 px-2"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Lembrete</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={editForm.message}
                      onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  {reminder.reminder_type === 'low_stock' && (
                    <div>
                      <Label htmlFor="threshold">Limite do Estoque</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={editForm.threshold_quantity}
                        onChange={(e) => setEditForm(prev => ({ ...prev, threshold_quantity: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  )}
                  <Button onClick={handleSaveEdit} className="w-full">
                    Salvar Alterações
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Botão Excluir */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-6 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Lembrete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteReminder(reminder.id)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Botão Marcar como lido */}
            {!reminder.is_read && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markAsRead(reminder.id)}
                className="text-xs h-6 px-2"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Lembretes
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum lembrete ativo</p>
          </div>
        ) : (
          <Tabs defaultValue="unread" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unread" className="flex items-center gap-2">
                Novos
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center gap-2">
                Lidos
                {readReminders.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {readReminders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="unread" className="mt-4">
              {unreadReminders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum lembrete novo</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {unreadReminders.map((reminder, index) => (
                      <div key={reminder.id}>
                        {renderReminderCard(reminder)}
                        {index < unreadReminders.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
            
            <TabsContent value="read" className="mt-4">
              {readReminders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum lembrete lido</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {readReminders.map((reminder, index) => (
                      <div key={reminder.id}>
                        {renderReminderCard(reminder)}
                        {index < readReminders.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default RemindersPanel;