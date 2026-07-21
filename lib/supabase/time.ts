// lib/supabase/time.ts
import { createClient } from './server';

// Ambil waktu server
export async function getServerTime() {
  const supabase = createClient();
  const { data } = await supabase.rpc('get_server_time');
  return data;
}

// Ambil tanggal awal bulan ini (server time)
export async function getStartOfMonth() {
  const supabase = createClient();
  const { data } = await supabase
    .from('transactions')
    .select('date_trunc(month, current_date)')
    .limit(1);
  return data?.[0]?.date_trunc;
}