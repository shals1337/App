import { supabase } from './supabase';
import type { ImportPayload } from '../storage';

/**
 * Sync model: one JSON document per user in the `user_data` table
 * (columns: user_id uuid PK, data jsonb, updated_at timestamptz).
 * Last-write-wins by updated_at — simple and robust for a single-user
 * personal app. See README for the SQL + row-level-security policy.
 */

export interface RemoteState {
  data: ImportPayload;
  updatedAt: string;
}

export async function pullRemote(userId: string): Promise<RemoteState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return { data: data.data as ImportPayload, updatedAt: data.updated_at as string };
}

export async function pushRemote(userId: string, payload: ImportPayload): Promise<void> {
  if (!supabase) return;
  await supabase.from('user_data').upsert(
    {
      user_id: userId,
      data: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}
