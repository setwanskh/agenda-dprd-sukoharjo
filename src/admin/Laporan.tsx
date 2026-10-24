import { useMemo, useState } from 'react'
import writeExcelFile from 'write-excel-file/browser'
import { supabase } from '../lib/supabase'
import { ambilAgendaRentang } from '../lib/agendaData'
import { buatLaporan } from '../lib/laporan'
import type { Agenda } from '../lib/types'
import { wib } from '../lib/waktu'
import { useNotify } from './ui'

export default function Laporan({ agendas, org, reload }: { agendas: Agenda[]; org: string; reload: () => void }) {
  const notify = useNotify()
  const hari = wib().tanggal
  const tahunIni = Number(hari.slice(0, 4))
  const daftarTahun = useMemo(() => [...new Set([tahunIni, ...agendas.map(a => Number(a.agenda_date.slice(0, 4)))])].sort((a, b) => b - a), [agendas, tahunIni])
  const [tahun, setTahun] = useState(tahunIni)
  const [busy, setBusy] = useState(false)
  const [lap, setLap] = useState<{ ids: string[]; nama: string } | null>(null)
  const [ya, setYa] = useState(false)
  const [kata, setKata] = useState('')
  const dalam = agendas.filter(a => a.agenda_date.startsWith(tahun + '-'))
  const mendatang = dalam.filter(a => a.agenda_date > hari).length
  const kunci = `HAPUS ${tahun}`

  async function unduh() {
    setBusy(true)
    try {
      const list = await ambilAgendaRentang(`${tahun}-01-01`, `${tahun}-12-31`)
      if (!list.length) return notify('Tidak ada agenda pada tahun ' + tahun, true)
      const nama = `Laporan-Agenda-DPRD-Sukoharjo-${tahun}.xlsx`
      const w = wib()
      await writeExcelFile(buatLaporan(tahun, list, org, `${w.panjang}, ${w.jam} WIB`)).toFile(nama)
      setLap({ ids: list.map(a => a.id), nama }); setYa(false); setKata('')
      notify(`Laporan ${list.length} agenda diunduh`)
    } catch (e) {
      notify('Gagal membuat laporan: ' + (e instanceof Error ? e.message : 'kesalahan tidak dikenal'), true)
    } finally { setBusy(false) }
  }

  async function hapus() {
    if (!lap) return
    setBusy(true)
    try {
      // Hanya agenda yang ikut tercetak di laporan yang dihapus (berdasarkan ID), bukan seluruh tahun.
      for (let i = 0; i < lap.ids.length; i += 100) {
        const { error } = await supabase.from('agendas').delete().in('id', lap.ids.slice(i, i + 100))
        if (error) { notify(`Penghapusan berhenti setelah ${i} agenda: ${error.message}`, true); reload(); return }
      }
      notify(`${lap.ids.length} agenda tahun ${tahun} dihapus dari database`); setLap(null); setYa(false); setKata(''); reload()
    } finally { setBusy(false) }
  }

  return <>
    <div className="card"><h3>Laporan agenda per tahun</h3>
      <div className="g">
        <label>Tahun<select value={tahun} onChange={e => { setTahun(Number(e.target.value)); setLap(null) }}>{daftarTahun.map(t => <option key={t}>{t}</option>)}</select></label>
        <div><br />Agenda tahun {tahun} di database: <b>{dalam.length}</b></div>
      </div>
      <p>Laporan berformat Excel (.xlsx) dengan dua lembar: <b>Ringkasan</b> (total, per bulan, per jenis kegiatan) dan <b>Daftar Agenda</b> (semua agenda lengkap).</p>
      <button className="btn p" disabled={busy || dalam.length === 0} onClick={unduh}>{busy ? 'Memproses…' : `Unduh laporan ${tahun}`}</button>
    </div>

    {lap && <div className="card dng"><h3>Hapus agenda tahun {tahun} dari database</h3>
      <p>Laporan <b>{lap.nama}</b> berisi <b>{lap.ids.length}</b> agenda. Hanya agenda yang tercantum di laporan itu yang akan dihapus. Agenda yang ditambahkan setelah laporan dibuat tidak ikut terhapus.</p>
      <p className="warn">Penghapusan bersifat <b>permanen</b> dan tidak bisa dibatalkan. Simpan file laporan di tempat yang aman terlebih dahulu.</p>
      {mendatang > 0 && <p className="warn">Perhatian: {mendatang} agenda di tahun ini bertanggal setelah hari ini dan ikut terhapus.</p>}
      <label className="ck"><input type="checkbox" checked={ya} onChange={e => setYa(e.target.checked)} /> Saya sudah membuka file laporan dan isinya benar.</label>
      <label>Ketik <b>{kunci}</b> untuk melanjutkan<input value={kata} onChange={e => setKata(e.target.value)} /></label>
      <p><button className="btn x" disabled={busy || !ya || kata.trim().toUpperCase() !== kunci} onClick={hapus}>Hapus {lap.ids.length} agenda sekarang</button>
        <button className="btn" onClick={() => setLap(null)}>Jangan hapus</button></p>
    </div>}
  </>
}
