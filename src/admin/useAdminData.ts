import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ambilAgendaRentang } from '../lib/agendaData'
import { DEFAULTS, mergeSettings, muatCache, simpanCache, type Settings } from '../lib/settings'
import type { Agenda, Master } from '../lib/types'

export function useAdminData() {
  const [d, setD] = useState(() => ({ agendas: [] as Agenda[], types: [] as Master[], rooms: [] as Master[], settings: (muatCache() ?? DEFAULTS) as Settings, online: true, ready: false }))
  const reload = useCallback(async () => {
    try {
      const [a, t, r, s] = await Promise.all([
        ambilAgendaRentang(),
        supabase.from('activity_types').select('*').order('sort').order('name'),
        supabase.from('meeting_rooms').select('*').order('sort').order('name'),
        supabase.from('app_settings').select('data').eq('id', 1).maybeSingle(),
      ])
      if (t.error || r.error || s.error) throw new Error('gagal')
      const st = mergeSettings(s.data?.data); simpanCache(st); setD({ agendas: [...a].sort((x, y) => y.agenda_date.localeCompare(x.agenda_date) || x.start_time.localeCompare(y.start_time)), types: t.data as Master[], rooms: r.data as Master[], settings: st, online: true, ready: true })
    } catch { setD(x => ({ ...x, online: false })) }
  }, [])
  useEffect(() => { reload(); const i = setInterval(reload, 30000); return () => clearInterval(i) }, [reload])
  return { ...d, reload }
}
