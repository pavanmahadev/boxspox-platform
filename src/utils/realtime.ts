import { createClient } from "@/utils/supabase/client";

/**
 * Boxspox Realtime Manager
 * Centralized subscription handling for Supabase Channels
 */

export const subscribeToChannel = (channelName: string, event: string, callback: (payload: any) => void) => {
  const supabase = createClient();
  
  const channel = supabase.channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: channelName === 'notifications' ? 'notifications' : undefined,
      },
      (payload: any) => callback(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const broadcastAnnouncement = async (message: string, type: 'info' | 'warning' | 'success' = 'info') => {
  const supabase = createClient();
  
  await supabase.channel('announcements').send({
    type: 'broadcast',
    event: 'new-announcement',
    payload: { message, type, timestamp: new Date().toISOString() },
  });
};
