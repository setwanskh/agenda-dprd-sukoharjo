import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, configured } from '../lib/supabase'

export interface AdminState { loading: boolean; session: Session | null; isAdmin: boolean }

/** Admin = pengguna yang login DAN terdaftar di tabel admin_users (dicek oleh database). */
export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({ loading: true, session: null, isAdmin: false })

  useEffect(() => {
    if (!configured) { setState({ loading: false, session: null, isAdmin: false }); return }
    const cek = async (session: Session | null) => {
      if (!session) return setState({ loading: false, session: null, isAdmin: false })
      const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle()
      setState({ loading: false, session, isAdmin: Boolean(data) })
    }
    supabase.auth.getSession().then(({ data }) => cek(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { cek(s) })
    return () => sub.subscription.unsubscribe()
  }, [])

  return state
}
