import type { SheetData } from 'write-excel-file/browser'
import type { Agenda } from './types'

export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const hhmm = (t: string | null) => (t ? t.slice(0, 5) : null)
const dmy = (d: string) => d.split('-').reverse().join('/')
const namaHari = (d: string) => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long' }).format(new Date(d + 'T12:00:00+07:00'))
const b = (value: string) => ({ value, fontWeight: 'bold' as const })

export function ringkasan(list: Agenda[]) {
  const perBulan = Array<number>(12).fill(0)
  const jenis = new Map<string, number>()
  for (const a of list) {
    perBulan[Number(a.agenda_date.slice(5, 7)) - 1]++
    jenis.set(a.activity_type, (jenis.get(a.activity_type) ?? 0) + 1)
  }
  const perJenis = [...jenis.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
  return { total: list.length, perBulan, perJenis }
}

/** Dua lembar Excel: Ringkasan (total, per bulan, per jenis) dan Daftar Agenda (semua baris). */
export function buatLaporan(tahun: number, list: Agenda[], org: string, dicetak: string) {
  const r = ringkasan(list)
  const ringkas: SheetData = [
    [b(`LAPORAN AGENDA ${org}`)], [`Tahun ${tahun}`], [`Dicetak: ${dicetak}`], [],
    [b('Total agenda'), r.total], [],
    [b('Bulan'), b('Jumlah agenda')], ...r.perBulan.map((n, i) => [BULAN[i], n]), [],
    [b('Jenis kegiatan'), b('Jumlah agenda')], ...r.perJenis.map(([n, c]) => [n, c]),
  ]
  const judul = ['No', 'Tanggal', 'Hari', 'Jam Mulai', 'Jam Selesai', 'Jenis Kegiatan', 'Nama Kegiatan', 'Detail', 'Asal Instansi', 'Tempat', 'Keterangan'].map(b)
  const daftar: SheetData = [judul, ...list.map((a, i) =>
    [i + 1, dmy(a.agenda_date), namaHari(a.agenda_date), hhmm(a.start_time), hhmm(a.end_time), a.activity_type, a.title, a.detail, a.origin, a.room_name, a.note])]
  return [
    { data: ringkas, sheet: 'Ringkasan', columns: [{ width: 34 }, { width: 18 }] },
    { data: daftar, sheet: 'Daftar Agenda', columns: [5, 12, 10, 10, 11, 22, 40, 32, 26, 24, 30].map(width => ({ width })) },
  ]
}
