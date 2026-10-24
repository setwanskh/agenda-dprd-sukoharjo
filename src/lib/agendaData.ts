import { supabase } from './supabase'
import type { Agenda } from './types'

/** Mengambil agenda per halaman 1000 baris (batas Supabase), agar tidak ada yang terpotong. */
export async function ambilAgendaRentang(dari?: string, sampai?: string): Promise<Agenda[]> {
  const hasil: Agenda[] = []
  for (let from = 0; ; from += 1000) {
    let q = supabase.from('agendas').select('*').order('agenda_date').order('start_time').order('id').range(from, from + 999)
    if (dari) q = q.gte('agenda_date', dari)
    if (sampai) q = q.lte('agenda_date', sampai)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    hasil.push(...((data ?? []) as Agenda[]))
    if (!data || data.length < 1000) break
  }
  return hasil
}
