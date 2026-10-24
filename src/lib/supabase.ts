import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const configured = Boolean(url && key && !url.includes('ISI-'))

// Jika .env belum diisi, aplikasi tetap tampil dan memberi petunjuk, bukan layar kosong.
export const supabase = createClient(
  configured ? url! : 'https://belum-dikonfigurasi.invalid',
  configured ? key! : 'belum-dikonfigurasi'
)
