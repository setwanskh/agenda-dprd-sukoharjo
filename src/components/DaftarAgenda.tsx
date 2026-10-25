import { useEffect, useRef } from 'react'
import type { Agenda, StatusAgenda } from '../lib/types'
import type { Settings } from '../lib/settings'
import { durasiGulir, targetGulir } from '../lib/gulir'

export type Baris = Agenda & { st: StatusAgenda }

const LABEL = { akan_datang: 'AKAN DATANG', berlangsung: 'SEDANG BERLANGSUNG', selesai: 'SELESAI' } as const
const jam = (t: string) => t.slice(0, 5).replace(':', '.')

const JEDA_ATAS = 7000   // tahan di agenda aktif sebelum menggulir
const JEDA_BAWAH = 5000  // tahan di dasar daftar sebelum kembali

/**
 * Daftar agenda. Bila semua muat, semuanya tampil diam. Bila tidak muat:
 * agenda selesai tergulir keluar (tertutup) dan agenda berlangsung / akan datang berada di atas;
 * jika sisanya masih terlalu panjang, daftar bergulir pelan sendiri lalu kembali ke atas.
 */
export default function DaftarAgenda({ rows, show }: { rows: Baris[]; show: Settings['show'] }) {
  const vp = useRef<HTMLDivElement>(null)
  const isi = useRef<HTMLDivElement>(null)
  const kunci = rows.map(r => r.id + r.st).join()

  useEffect(() => {
    const v = vp.current, c = isi.current
    if (!v || !c) return
    const idx = rows.findIndex(r => r.st !== 'selesai')
    let hidup = true, raf = 0, timer = 0
    const tidur = (ms: number) => new Promise<void>(res => { timer = window.setTimeout(res, ms) })
    const geser = (ke: number, ms: number) => new Promise<void>(res => {
      const dari = v.scrollTop, t0 = performance.now()
      const f = (t: number) => {
        if (!hidup) return res()
        const p = Math.min(1, (t - t0) / ms)
        v.scrollTop = dari + (ke - dari) * p
        if (p < 1) raf = requestAnimationFrame(f); else res()
      }
      raf = requestAnimationFrame(f)
    })
    ;(async () => {
      while (hidup) {
        const overflow = c.scrollHeight - v.clientHeight
        const aktif = idx >= 0 ? (c.children[idx] as HTMLElement | undefined)?.offsetTop ?? null : null
        const target = targetGulir(aktif, overflow)
        if (overflow <= 1) { v.scrollTop = 0; await tidur(3000); continue }   // muat: cek ulang berkala (mis. layar diubah ukurannya)
        await geser(target, 800)
        const sisa = overflow - target
        if (sisa <= 1) { await tidur(5000); continue }                       // bagian aktif sudah muat: diam
        await tidur(JEDA_ATAS)
        await geser(overflow, durasiGulir(sisa))
        await tidur(JEDA_BAWAH)
      }
    })()
    return () => { hidup = false; cancelAnimationFrame(raf); clearTimeout(timer) }
  }, [kunci])

  return (
    <>
      <div className="row rowh"><span>No</span><span>Agenda</span><span>Waktu</span><span>Tempat</span><span>Status</span></div>
      <div className="scr" ref={vp}>
        <div className="isi" ref={isi}>
          {rows.map((a, i) => (
            <div key={a.id} className={'row ' + a.st}>
              <span>{i + 1}</span>
              <div>
                <span className="jn">{a.activity_type}{a.origin ? ' · ' + a.origin : ''}</span>
                <span className="nm">{a.title}{a.detail ? ' – ' + a.detail : ''}</span>
              </div>
              <span className="tm">{jam(a.start_time)}{a.end_time ? ' – ' + jam(a.end_time) : ''} WIB</span>
              <span>{a.room_name}</span>
              {show[a.st] ? <span className={'bd ' + a.st}>{LABEL[a.st]}</span> : <span />}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
