import { describe, expect, it } from 'vitest'
import { mergeSettings } from './settings'

describe('mergeSettings', () => {
  it('jam pelayanan lama (satu teks) menjadi daftar', () => {
    expect(mergeSettings({ complaint: { hours: 'Senin - Kamis : 07:00 - 15:30' } }).complaint.hours).toEqual(['Senin - Kamis : 07:00 - 15:30'])
  })
  it('jam pelayanan berupa daftar dipertahankan (dua baris)', () => {
    expect(mergeSettings({ complaint: { hours: ['A', 'B'] } }).complaint.hours).toEqual(['A', 'B'])
  })
  it('data kosong memakai nilai bawaan', () => {
    const s = mergeSettings(null)
    expect(s.complaint.hours).toEqual([])
    expect(s.complaint.instagram).toBe('')
    expect(s.show.showDone).toBe(true)
  })
})

import { THEMES } from './settings'
describe('THEMES', () => {
  it('semua tema memiliki variabel warna yang sama', () => {
    const kunci = Object.keys(THEMES.mhe.vars).sort()
    for (const [k, t] of Object.entries(THEMES)) expect(Object.keys(t.vars).sort(), k).toEqual(kunci)
    expect(Object.keys(THEMES).length).toBe(14)
  })
})

const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }
const kontras = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
describe('kontras tema (WCAG)', () => {
  for (const [k, t] of Object.entries(THEMES)) {
    it(`${k}: teks utama terbaca dan aksen cukup jelas`, () => {
      expect(kontras(t.vars['--tx'], t.vars['--t2'])).toBeGreaterThanOrEqual(4.5)
      expect(kontras(t.vars['--ac'], t.vars['--t2'])).toBeGreaterThanOrEqual(3)
    })
  }
})
