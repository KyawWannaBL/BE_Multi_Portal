-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.supply_chain_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    way_id text NOT NULL,
    segment text NOT NULL,
    event_type text NOT NULL,
    note text,
    actor_user_id uuid DEFAULT auth.uid(),
    event_hash text
);
-- Anti-fraud index
CREATE INDEX IF NOT EXISTS idx_sc_way ON public.supply_chain_events(way_id);
