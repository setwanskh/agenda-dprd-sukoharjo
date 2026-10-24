import type { StatusAgenda } from './types'

export const TZ = 'Asia/Jakarta'

/** Waktu sekarang di WIB. Tidak memakai UTC langsung, sehingga tanggal tidak bergeser. */
export function wib(date: Date = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(date).map(x => [x.type, x.value])
  )
  return {
    tanggal: `${p.year}-${p.month}-${p.day}`,          // untuk dicocokkan dengan agenda_date
    menit: Number(p.hour) * 60 + Number(p.minute),     // menit sejak 00:00 WIB
    jam: `${p.hour}.${p.minute}.${p.second}`,          // contoh: 13.59.42
    panjang: new Intl.DateTimeFormat('id-ID', { timeZone: TZ, dateStyle: 'full' }).format(date),
  }
}

export function keMenit(t: string): number {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}

/** Selesai = tepat pada jam selesai. Jika jam selesai kosong, pakai durasi default (menit). */
export function hitungStatus(mulai: string, selesai: string | null, menitSekarang: number, durasi = 60): StatusAgenda {
  const s = keMenit(mulai)
  const e = selesai ? keMenit(selesai) : s + durasi
  if (menitSekarang < s) return 'akan_datang'
  if (menitSekarang < e) return 'berlangsung'
  return 'selesai'
}

/** Urut jam mulai, lalu judul (aturan kedua yang konsisten). */
export function urutkan<T extends { start_time: string; title: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.start_time.localeCompare(b.start_time) || a.title.localeCompare(b.title))
}
