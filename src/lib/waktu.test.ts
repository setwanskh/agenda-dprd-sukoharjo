import { describe, expect, it } from 'vitest'
import { hitungStatus, urutkan, wib } from './waktu'

describe('wib', () => {
  it('tanggal tidak bergeser: 17:30 UTC sudah hari berikutnya di WIB', () => {
    const w = wib(new Date('2026-10-24T17:30:00Z'))
    expect(w.tanggal).toBe('2026-10-25')
    expect(w.jam).toBe('00.30.00')
  })
  it('format jam WIB', () => {
    expect(wib(new Date('2026-10-24T06:59:42Z')).jam).toBe('13.59.42')
  })
})

describe('hitungStatus (mulai 09.00, selesai 10.00)', () => {
  it('sebelum 09.00 = akan datang', () => expect(hitungStatus('09:00:00', '10:00:00', 539)).toBe('akan_datang'))
  it('09.00 = berlangsung', () => expect(hitungStatus('09:00:00', '10:00:00', 540)).toBe('berlangsung'))
  it('09.59 = berlangsung', () => expect(hitungStatus('09:00:00', '10:00:00', 599)).toBe('berlangsung'))
  it('10.00 = selesai', () => expect(hitungStatus('09:00:00', '10:00:00', 600)).toBe('selesai'))
  it('tanpa jam selesai memakai durasi default', () => expect(hitungStatus('09:00:00', null, 629, 90)).toBe('berlangsung'))
})

describe('urutkan', () => {
  it('urut jam mulai lalu judul', () => {
    const r = urutkan([
      { start_time: '13:00:00', title: 'B' }, { start_time: '07:30:00', title: 'Z' }, { start_time: '13:00:00', title: 'A' },
    ])
    expect(r.map(x => x.title)).toEqual(['Z', 'A', 'B'])
  })
})
