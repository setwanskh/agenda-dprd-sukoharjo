import { describe, expect, it } from 'vitest'
import writeExcelFile from 'write-excel-file/node'
import { buatLaporan, ringkasan } from './laporan'
import type { Agenda } from './types'

const ag = (id: string, date: string, type: string, start = '09:00:00'): Agenda =>
  ({ id, agenda_date: date, activity_type: type, title: 'T' + id, detail: null, origin: null, start_time: start, end_time: null, room_name: null, note: null })

describe('laporan', () => {
  const data = [ag('1', '2026-01-05', 'Rapat'), ag('2', '2026-01-20', 'Rapat'), ag('3', '2026-12-31', 'Audiensi')]
  it('ringkasan menghitung per bulan dan per jenis', () => {
    const r = ringkasan(data)
    expect(r.total).toBe(3)
    expect(r.perBulan[0]).toBe(2)
    expect(r.perBulan[11]).toBe(1)
    expect(r.perJenis[0]).toEqual(['Rapat', 2])
  })
  it('berkas Excel valid dapat dibuat dengan dua lembar', async () => {
    const sheets = buatLaporan(2026, data, 'DPRD UJI', '24 Oktober 2026')
    expect(sheets.map(s => s.sheet)).toEqual(['Ringkasan', 'Daftar Agenda'])
    const buf = await writeExcelFile(sheets).toBuffer()
    expect(buf.length).toBeGreaterThan(1000)
    expect(Array.from(buf.slice(0, 2))).toEqual([0x50, 0x4b]) // tanda berkas zip/xlsx "PK"
  })
})
