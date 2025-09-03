import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Reminder {
  id: string;
  reminder_type: 'low_stock' | 'restock' | 'donation_check';
  title: string;
  message: string;
  age_group_name: string | null;
  current_stock: number;
  threshold_quantity: number | null;
  is_read: boolean;
  triggered_at: string | null;
  created_at: string;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReminders = async () => {
    if (!user) {
      console.log('No user found in useReminders');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching reminders for user:', user.id);
      
      const { data, error } = await supabase.rpc('get_user_reminders', {
        target_user_id: user.id
      });

      console.log('RPC response:', { data, error });

      if (error) throw error;
      
      const processedData = (data || []).map((item: any) => ({
        ...item,
        reminder_type: item.reminder_type as 'low_stock' | 'restock' | 'donation_check'
      }));
      
      console.log('Processed reminders:', processedData);
      setReminders(processedData);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Erro ao carregar lembretes');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_read: true })
        .eq('id', reminderId);

      if (error) throw error;
      
      setReminders(prev => 
        prev.map(reminder => 
          reminder.id === reminderId 
            ? { ...reminder, is_read: true }
            : reminder
        )
      );
    } catch (error) {
      console.error('Error marking reminder as read:', error);
      toast.error('Erro ao marcar lembrete como lido');
    }
  };

  const createReminder = async (reminderData: {
    age_group_id?: string;
    reminder_type: 'low_stock' | 'restock' | 'donation_check';
    title: string;
    message: string;
    threshold_quantity?: number;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          ...reminderData
        });

      if (error) throw error;
      
      toast.success('Lembrete criado com sucesso');
      fetchReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Erro ao criar lembrete');
    }
  };

  const checkStockReminders = async () => {
    try {
      const { error } = await supabase.rpc('check_stock_reminders');
      if (error) throw error;
      fetchReminders();
    } catch (error) {
      console.error('Error checking stock reminders:', error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  // Check for stock reminders every 5 minutes
  useEffect(() => {
    const interval = setInterval(checkStockReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = reminders.filter(r => !r.is_read).length;

  return {
    reminders,
    loading,
    unreadCount,
    fetchReminders,
    markAsRead,
    createReminder,
    checkStockReminders
  };
};