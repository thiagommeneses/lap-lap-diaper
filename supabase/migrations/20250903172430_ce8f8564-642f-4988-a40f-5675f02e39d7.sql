-- Enable real-time for reminders table
ALTER TABLE public.reminders REPLICA IDENTITY FULL;

-- Add reminders table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;