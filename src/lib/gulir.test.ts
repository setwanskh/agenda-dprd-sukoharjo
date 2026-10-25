import { describe, expect, it } from 'vitest'
import { durasiGulir, targetGulir } from './gulir'

describe('targetGulir', () => {
  it('muat semua: tidak menggulir sama sekali', () => {
    expect(targetGulir(300, 0)).toBe(0)
    expect(targetGulir(null, 1)).toBe(0)
  })
  it('tidak muat: agenda selesai tergulir keluar, agenda aktif di paling atas', () => {
    expect(targetGulir(240, 600)).toBe(240)
  })
  it('agenda aktif sangat di bawah: berhenti di dasar daftar', () => {
    expect(targetGulir(900, 600)).toBe(600)
  })
  it('semua sudah selesai dan tidak muat: tampilkan bagian paling bawah', () => {
    expect(targetGulir(null, 500)).toBe(500)
  })
  it('agenda aktif pertama di paling atas: tidak ada yang digulir', () => {
    expect(targetGulir(0, 400)).toBe(0)
  })
})

describe('durasiGulir', () => {
  it('minimal 3 detik dan sebanding dengan jarak', () => {
    expect(durasiGulir(10)).toBe(3000)
    expect(durasiGulir(400)).toBe(10000)
  })
})
