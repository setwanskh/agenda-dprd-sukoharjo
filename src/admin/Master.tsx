import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Master } from '../lib/types'
import { HapusBtn, useNotify } from './ui'

export default function MasterPage({ tabel, judul, items, reload }: { tabel: 'activity_types' | 'meeting_rooms'; judul: string; items: Master[]; reload: () => void }) {
  const notify = useNotify()
  const [baru, setBaru] = useState('')
  const hasil = async (p: PromiseLike<{ error: { message: string } | null }>, ok?: string) => {
    const r = await p
    if (r.error) notify(r.error.message.includes('duplicate') ? 'Nama sudah ada' : 'Gagal: ' + r.error.message, true)
    else { if (ok) notify(ok); reload() }
  }
  return <div className="card"><h3>{judul}</h3>
    {items.map(m => <div className="mrow" key={m.id + m.name}>
      <input defaultValue={m.name} onBlur={e => { const v = e.target.value.trim(); if (v && v !== m.name) hasil(supabase.from(tabel).update({ name: v }).eq('id', m.id), 'Nama diubah') }} />
      <label className="ck"><input type="checkbox" checked={m.active} onChange={e => hasil(supabase.from(tabel).update({ active: e.target.checked }).eq('id', m.id))} /> aktif</label>
      <HapusBtn onConfirm={() => hasil(supabase.from(tabel).delete().eq('id', m.id), 'Dihapus')} />
    </div>)}
    <div className="mrow"><input placeholder="Tambah baru" value={baru} onChange={e => setBaru(e.target.value)} />
      <button className="btn p" onClick={() => { const v = baru.trim(); if (v) { hasil(supabase.from(tabel).insert({ name: v, sort: items.length + 1 }), 'Ditambahkan'); setBaru('') } }}>Tambah</button></div>
    <small>Mengubah, menonaktifkan, atau menghapus tidak mengubah agenda lama; nama yang sudah tersimpan di agenda tetap tampil.</small>
  </div>
}
