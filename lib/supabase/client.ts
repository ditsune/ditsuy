import { createBrowserClient } from '@supabase/ssr';

// Singleton — JANGAN bikin createBrowserClient() baru tiap kali butuh
// client. Dulu tiap fungsi di lib/queries.ts manggil createClient()
// sendiri-sendiri, jadi Promise.all() yang manggil 3-4 query sekaligus
// bikin 3-4 instance GoTrueClient kebentuk bersamaan, masing-masing baca
// & refresh session dari localStorage tanpa koordinasi satu sama lain.
// Race condition itu yang bikin error "JWT issued at future" muncul
// sekali-sekali dan cuma "sembuh" pas hard refresh (yang nge-reset semua
// instance jadi konsisten lagi, bukan beneran ngilangin race-nya).
let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
