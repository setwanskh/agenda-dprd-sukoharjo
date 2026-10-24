import { useCallback, useEffect, useState } from 'react'
import { configured, supabase } from './supabase'
import { DEFAULTS, mergeSettings, type Settings } from './settings'
import type { Agenda } from './types'

/**
 * Mengambil agenda untuk tanggal WIB yang diberikan + pengaturan.
 * Pembaruan: realtime Supabase, ditambah polling 30 detik sebagai cadangan.
 * Jika koneksi putus, data terakhir tetap tampil dan online=false.
 */
export function useDisplayData(tanggal: string) {
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [online, setOnline] = useState(true)

  const load = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([
        supabase.from('agendas').select('*').eq('agenda_date', tanggal),
        supabase.from('app_settings').select('data').eq('id', 1).maybeSingle(),
      ])
      if (a.error || s.error) throw new Error('gagal memuat')
      setAgendas((a.data ?? []) as Agenda[])
      if (s.data) setSettings(mergeSettings(s.data.data))
      setOnline(true)
    } catch {
      setOnline(false)   // data lama tidak dihapus
    }
  }, [tanggal])

  useEffect(() => {
    if (!configured) return
    load()
    const ch = supabase.channel('display-' + tanggal)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agendas' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, load)
      .subscribe()
    const t = setInterval(load, 30000)
    window.addEventListener('online', load)
    return () => { clearInterval(t); window.removeEventListener('online', load); supabase.removeChannel(ch) }
  }, [load, tanggal])

  return { agendas, settings, online }
}
