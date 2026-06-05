"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

export type SaleMode = 'PROMO' | 'FESTIVAL' | 'BLACK_FRIDAY';

interface SalesEvent {
  id: string;
  name: string;
  type: SaleMode;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export function useSalesState() {
  const [saleMode, setSaleMode] = useState<SaleMode>('PROMO');
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchActiveSale() {
      try {
        const { data, error } = await supabase
          .from('sales_events')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn("Sales state table missing or error:", error.message || error);
          return;
        }

        if (data && data.type) {
          // If there's an ends_at, we could check if it has expired
          if (data.ends_at && new Date(data.ends_at) < new Date()) {
            setSaleMode('PROMO'); // fallback
          } else {
            setSaleMode(data.type as SaleMode);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch active sale", err);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveSale();
    
    // Set up realtime listener for instant updates when admin changes sale mode
    const channel = supabase.channel('sales_events_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales_events' },
        () => {
          // Refetch when any change occurs in sales_events
          fetchActiveSale();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { saleMode, loading };
}
