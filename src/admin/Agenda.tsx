import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Agenda, Master } from '../lib/types'
import { wib } from '../lib/waktu'
import { HapusBtn, useNotify } from './ui'

type Form = { agenda_date: string; activity_type: string; title: string; detail: string; origin: string; start_time: string; end_time: string; room_name: string; note: string }
const kosong = (): Form => ({ agenda_date: wib().tanggal, activity_type: '', title: '', detail: '', origin: '', start_time: '', end_time: '', room_name: '', note: '' })
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '')
const dmy = (d: string) => d.split('-').reverse().join('/')

export default function AgendaPage({ agendas, types, rooms, reload }: { agendas: Agenda[]; types: Master[]; rooms: Master[]; reload: () => void }) {
  const notify = useNotify()
  const [f, setF] = useState<Form>(kosong())
  const [editId, setEditId] = useState<string | null>(null)
  const [manual, setManual] = useState(false)
  const [simpanMaster, setSM] = useState(false)
  const [q, setQ] = useState({ d: '', s: '', c: 'all' })
  const [salin, setSalin] = useState('')
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }))
  const hari = wib().tanggal

  const reset = () => { setF(kosong()); setEditId(null); setManual(false); setSM(false) }

  async function simpan() {
    if (!f.agenda_date || !f.activity_type || !f.title.trim() || !f.start_time) return notify('Tanggal, jenis kegiatan, nama kegiatan, dan jam mulai wajib diisi', true)
    if (f.end_time && f.end_time.slice(0, 5) <= f.start_time.slice(0, 5)) return notify('Jam selesai harus setelah jam mulai', true)
    const row = { agenda_date: f.agenda_date, activity_type: f.activity_type, title: f.title.trim(), detail: f.detail.trim() || null, origin: f.origin.trim() || null,
      start_time: f.start_time, end_time: f.end_time || null, room_name: f.room_name.trim() || null, note: f.note.trim() || null }
    const r = editId ? await supabase.from('agendas').update(row).eq('id', editId) : await supabase.from('agendas').insert(row)
    if (r.error) return notify('Gagal menyimpan: ' + r.error.message, true)
    if (manual && simpanMaster && row.room_name && !rooms.some(x => x.name === row.room_name)) await supabase.from('meeting_rooms').insert({ name: row.room_name, sort: rooms.length + 1 })
    notify(editId ? 'Agenda diperbarui' : 'Agenda ditambahkan'); reset(); reload()
  }
  function ubah(a: Agenda) {
    setF({ agenda_date: a.agenda_date, activity_type: a.activity_type, title: a.title, detail: a.detail ?? '', origin: a.origin ?? '',
      start_time: hhmm(a.start_time), end_time: hhmm(a.end_time), room_name: a.room_name ?? '', note: a.note ?? '' })
    setEditId(a.id); setManual(Boolean(a.room_name) && !rooms.some(x => x.name === a.room_name)); window.scrollTo(0, 0)
  }
  async function hapus(id: string) {
    const r = await supabase.from('agendas').delete().eq('id', id)
    if (r.error) return notify('Gagal menghapus: ' + r.error.message, true)
    notify('Agenda dihapus'); reload()
  }
  async function salinDari() {
    const src = agendas.filter(a => a.agenda_date === salin)
    if (!salin || !f.agenda_date) return notify('Isi tanggal sumber dan tanggal tujuan', true)
    if (!src.length) return notify('Tidak ada agenda pada tanggal sumber', true)
    if (salin === f.agenda_date) return notify('Tanggal sumber dan tujuan sama', true)
    const rows = src.map(a => ({ activity_type: a.activity_type, title: a.title, detail: a.detail, origin: a.origin, start_time: a.start_time,
      end_time: a.end_time, room_name: a.room_name, note: a.note, agenda_date: f.agenda_date }))
    const r = await supabase.from('agendas').insert(rows)
    if (r.error) return notify('Gagal menyalin: ' + r.error.message, true)
    notify(`${rows.length} agenda disalin ke ${dmy(f.agenda_date)}`); reload()
  }

  const jenis = types.filter(t => t.active || t.name === f.activity_type)
  const daftar = agendas.filter(a =>
    (!q.d || a.agenda_date === q.d) &&
    (!q.s || (a.title + (a.origin ?? '') + a.activity_type + (a.room_name ?? '')).toLowerCase().includes(q.s.toLowerCase())) &&
    (q.c === 'all' || (q.c === 'today' && a.agenda_date === hari) || (q.c === 'up' && a.agenda_date > hari) || (q.c === 'past' && a.agenda_date < hari)))

  return <>
    <div className="card"><h3>{editId ? 'Ubah agenda' : 'Tambah agenda'}</h3>
      <div className="g">
        <label>Tanggal *<input type="date" value={f.agenda_date} onChange={set('agenda_date')} /></label>
        <label>Jenis kegiatan *<select value={f.activity_type} onChange={set('activity_type')}><option value="">Pilih…</option>{jenis.map(t => <option key={t.id}>{t.name}</option>)}</select></label>
        <label>Nama kegiatan *<input value={f.title} onChange={set('title')} /></label>
        <label>Detail kegiatan<input value={f.detail} onChange={set('detail')} /></label>
        <label>Asal tamu / instansi<input value={f.origin} onChange={set('origin')} /></label>
        <label>Jam mulai *<input type="time" value={f.start_time} onChange={set('start_time')} /></label>
        <label>Jam selesai (opsional)<input type="time" value={f.end_time} onChange={set('end_time')} /></label>
        <label>Tempat
          <select value={manual ? '__x' : f.room_name} onChange={e => { if (e.target.value === '__x') { setManual(true); setF(p => ({ ...p, room_name: '' })) } else { setManual(false); setF(p => ({ ...p, room_name: e.target.value })) } }}>
            <option value="">Pilih…</option>{rooms.filter(r => r.active || r.name === f.room_name).map(r => <option key={r.id}>{r.name}</option>)}<option value="__x">Tempat Lainnya…</option></select>
          {manual && <><input placeholder="Ketik nama tempat" value={f.room_name} onChange={set('room_name')} />
            <label className="ck"><input type="checkbox" checked={simpanMaster} onChange={e => setSM(e.target.checked)} /> simpan ke master tempat</label></>}
        </label>
        <label>Keterangan tambahan<input value={f.note} onChange={set('note')} /></label>
      </div>
      <p className="bar"><button className="btn p" onClick={simpan}>Simpan</button>{editId && <button className="btn" onClick={reset}>Batal</button>}
        <span className="sp" />Salin dari tanggal: <input type="date" className="inl" value={salin} onChange={e => setSalin(e.target.value)} />
        <button className="btn" onClick={salinDari}>Salin ke tanggal di atas</button></p>
    </div>
    <div className="card"><h3>Daftar agenda</h3>
      <div className="g">
        <label>Filter tanggal<input type="date" value={q.d} onChange={e => setQ({ ...q, d: e.target.value })} /></label>
        <label>Cari<input value={q.s} onChange={e => setQ({ ...q, s: e.target.value })} /></label>
        <label>Tampilkan<select value={q.c} onChange={e => setQ({ ...q, c: e.target.value })}>
          <option value="all">Semua</option><option value="today">Agenda hari ini</option><option value="up">Agenda mendatang</option><option value="past">Riwayat</option></select></label>
      </div>
      <div className="scroll"><table><thead><tr><th>Tanggal</th><th>Jam</th><th>Kegiatan</th><th>Tempat</th><th /></tr></thead><tbody>
        {daftar.map(a => <tr key={a.id}><td>{dmy(a.agenda_date)}</td><td>{hhmm(a.start_time)}{a.end_time ? '–' + hhmm(a.end_time) : ''}</td>
          <td><b>{a.title}</b>{a.detail ? ' – ' + a.detail : ''}<br /><span className="tag">{a.activity_type}</span> {a.origin}</td><td>{a.room_name}</td>
          <td className="nw"><button className="btn" onClick={() => ubah(a)}>Ubah</button> <HapusBtn onConfirm={() => hapus(a.id)} /></td></tr>)}
        {daftar.length === 0 && <tr><td colSpan={5}>Tidak ada agenda.</td></tr>}</tbody></table></div>
    </div>
  </>
}
