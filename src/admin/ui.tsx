import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Notify = (msg: string, err?: boolean) => void
const Ctx = createContext<Notify>(() => {})
export const useNotify = () => useContext(Ctx)

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ m: string; err: boolean } | null>(null)
  const n = useCallback<Notify>((m, err = false) => { setT({ m, err }); setTimeout(() => setT(null), 3500) }, [])
  return <Ctx.Provider value={n}>{children}{t && <div className={'toast' + (t.err ? ' err' : '')}>{t.m}</div>}</Ctx.Provider>
}

/** Tombol hapus dua klik agar tidak terhapus tanpa sengaja. */
export function HapusBtn({ onConfirm }: { onConfirm: () => void }) {
  const [arm, setArm] = useState(false)
  return <button className="btn x" onClick={() => { if (arm) { setArm(false); onConfirm() } else { setArm(true); setTimeout(() => setArm(false), 4000) } }}>
    {arm ? 'Klik lagi untuk hapus' : 'Hapus'}</button>
}

export function F({ l, v, on, type = 'text', ph }: { l: string; v: string | number; on: (v: string) => void; type?: string; ph?: string }) {
  return <label>{l}<input type={type} value={v} placeholder={ph} onChange={e => on(e.target.value)} /></label>
}
export function C({ l, v, on }: { l: string; v: boolean; on: (v: boolean) => void }) {
  return <label className="ck"><input type="checkbox" checked={v} onChange={e => on(e.target.checked)} /> {l}</label>
}

/** Daftar isian yang bisa ditambah dan dihapus (email, website, jam pelayanan). */
export function Daftar({ judul, v, on, ph, tambah }: { judul: string; v: string[]; on: (v: string[]) => void; ph?: string; tambah: string }) {
  return <div className="dft"><h4>{judul}</h4>
    {v.map((x, i) => <div className="mrow" key={i}>
      <input value={x} placeholder={ph} onChange={e => on(v.map((y, k) => (k === i ? e.target.value : y)))} />
      <button className="btn x" onClick={() => on(v.filter((_, k) => k !== i))}>Hapus</button></div>)}
    <button className="btn" onClick={() => on([...v, ''])}>{tambah}</button></div>
}
