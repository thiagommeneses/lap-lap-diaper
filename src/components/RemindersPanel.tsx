import { useState } from 'react';
import { Bell, AlertTriangle, Package, Calendar, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useReminders } from '@/hooks/useReminders';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RemindersPanel = () => {
  const { reminders, loading, unreadCount, markAsRead } = useReminders();
  const [showAll, setShowAll] = useState(false);

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

  const displayedReminders = showAll ? reminders : reminders.slice(0, 5);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Lembretes
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {reminders.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs"
            >
              {showAll ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver todos ({reminders.length})
                </>
              )}
            </Button>
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
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {displayedReminders.map((reminder, index) => (
                <div key={reminder.id}>
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
                      {!reminder.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(reminder.id)}
                          className="text-xs h-6 px-2"
                        >
                          Marcar lido
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < displayedReminders.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RemindersPanel;