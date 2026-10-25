import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { THEMES, type Settings, type ThemeKey } from '../lib/settings'
import { C, Daftar, F, useNotify } from './ui'

export default function Pengaturan({ settings, reload }: { settings: Settings; reload: () => void }) {
  const notify = useNotify()
  const [d, setD] = useState<Settings>(settings)
  const [pw, setPw] = useState('')
  const up = (p: Partial<Settings>) => setD(x => ({ ...x, ...p }))
  const cd = (k: 'email' | 'site' | 'hours') => (v: string[]) => setD(x => ({ ...x, complaint: { ...x.complaint, [k]: v } }))
  const cp = (k: Exclude<keyof Settings['complaint'], 'hours' | 'email' | 'site'>) => (v: string) => setD(x => ({ ...x, complaint: { ...x.complaint, [k]: v } }))
  const sh = (k: keyof Settings['show']) => (v: boolean) => setD(x => ({ ...x, show: { ...x.show, [k]: v } }))

  async function unggah(sisi: 'logoLeft' | 'logoRight', file?: File) {
    if (!file) return
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) return notify('Gunakan PNG, JPG, atau WebP maksimal 2 MB', true)
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${sisi}-${Date.now()}.${ext}`
    const r = await supabase.storage.from('logos').upload(path, file, { contentType: file.type })
    if (r.error) return notify('Unggah gagal: ' + r.error.message, true)
    up({ [sisi]: supabase.storage.from('logos').getPublicUrl(path).data.publicUrl } as Partial<Settings>)
    notify('Logo terunggah. Klik "Simpan pengaturan" untuk menerapkan.')
  }
  async function simpan() {
    if (d.surveyUrl && !/^https?:\/\//i.test(d.surveyUrl)) return notify('URL survei harus diawali http:// atau https://', true)
    if (!d.org.trim()) return notify('Nama instansi tidak boleh kosong', true)
    const bersih = (a: string[]) => a.map(s => s.trim()).filter(Boolean)
    const data = { ...d, complaint: { ...d.complaint, hours: bersih(d.complaint.hours), email: bersih(d.complaint.email), site: bersih(d.complaint.site) } }
    const r = await supabase.from('app_settings').upsert({ id: 1, data })
    if (r.error) return notify('Gagal menyimpan: ' + r.error.message, true)
    notify('Pengaturan tersimpan'); reload()
  }
  async function gantiPw() {
    if (pw.length < 8) return notify('Kata sandi minimal 8 karakter', true)
    const r = await supabase.auth.updateUser({ password: pw })
    if (r.error) return notify('Gagal: ' + r.error.message, true)
    setPw(''); notify('Kata sandi diganti')
  }
  const logo = (sisi: 'logoLeft' | 'logoRight', judul: string) => <label>{judul}
    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => unggah(sisi, e.target.files?.[0])} />
    {d[sisi] && <><img className="pv" src={d[sisi]} alt="" /><br /><button className="btn x" onClick={() => up({ [sisi]: '' } as Partial<Settings>)}>Hapus logo</button></>}</label>

  return <>
    <div className="card"><h3>Identitas dan tema</h3><div className="g">
      <F l="Nama instansi" v={d.org} on={v => up({ org: v })} />
      <label>Tema warna<select value={d.theme} onChange={e => up({ theme: e.target.value as ThemeKey })}>
        {(Object.keys(THEMES) as ThemeKey[]).map(k => <option key={k} value={k}>{THEMES[k].label}</option>)}</select></label></div>
      {(() => { const v = THEMES[d.theme].vars; return <div className="tpv" style={{ background: `linear-gradient(135deg, ${v['--t1']}, ${v['--t2']} 50%, ${v['--t3']})`, color: v['--tx'] }}>
        <b>{d.org}</b><span style={{ color: v['--ac'] }}>AGENDA HARI INI</span>
        <i style={{ background: v['--rw'], borderLeft: `4px solid ${v['--ac']}` }}>Contoh baris agenda</i></div> })()}
      <small>Pratinjau tema. Mengganti tema tidak mengubah data agenda.</small></div>
    <div className="card"><h3>Logo (PNG/JPG/WebP, maks 2 MB)</h3><div className="g">
      {logo('logoLeft', 'Logo kiri (logo utama)')}
      <div>{logo('logoRight', 'Logo kanan (HUT, peringatan, dll.)')}<C l="Tampilkan logo kanan" v={d.logoRightOn} on={v => up({ logoRightOn: v })} /></div></div></div>
    <div className="card"><h3>Status agenda</h3><div className="g">
      <C l="Tampilkan AKAN DATANG" v={d.show.akan_datang} on={sh('akan_datang')} /><C l="Tampilkan SEDANG BERLANGSUNG" v={d.show.berlangsung} on={sh('berlangsung')} />
      <C l="Tampilkan SELESAI" v={d.show.selesai} on={sh('selesai')} /><C l="Agenda selesai tetap ditampilkan" v={d.show.showDone} on={sh('showDone')} />
      <F l="Durasi default bila jam selesai kosong (menit)" type="number" v={d.duration} on={v => up({ duration: Math.max(5, Number(v) || 60) })} /></div></div>
    <div className="card"><h3>Survei kepuasan pelayanan</h3><div className="g">
      <F l="Judul" v={d.surveyTitle} on={v => up({ surveyTitle: v })} /><F l="URL survei (https://…)" v={d.surveyUrl} on={v => up({ surveyUrl: v })} />
      <F l="Keterangan singkat" v={d.surveyNote} on={v => up({ surveyNote: v })} /><C l="Aktifkan panel survei" v={d.surveyOn} on={v => up({ surveyOn: v })} /></div>
      {!d.surveyUrl && <small>URL belum diisi, jadi panel survei tidak tampil di display.</small>}</div>
    <div className="card"><h3>Informasi dan pengaduan</h3><div className="g">
      <F l="Telepon" v={d.complaint.phone} on={cp('phone')} />
      <F l="YouTube" v={d.complaint.youtube} on={cp('youtube')} ph="nama kanal" /><F l="Instagram" v={d.complaint.instagram} on={cp('instagram')} ph="@akun" />
      <F l="Facebook" v={d.complaint.facebook} on={cp('facebook')} ph="nama halaman" /><F l="TikTok" v={d.complaint.tiktok} on={cp('tiktok')} ph="@akun" />
      <F l="Petunjuk singkat" v={d.complaint.note} on={cp('note')} /></div>
      <Daftar judul="Email" v={d.complaint.email} on={cd('email')} ph="nama@instansi.go.id" tambah="+ Tambah email" />
      <Daftar judul="Website" v={d.complaint.site} on={cd('site')} ph="alamat.situs.go.id" tambah="+ Tambah website" />
      <p><small>Boleh lebih dari satu email dan website. Kosongkan semua jika belum ada; panel tidak akan tampil.</small></p></div>
    <div className="card"><h3>Jam pelayanan (kotak tersendiri di display)</h3>
      <Daftar judul="Jam pelayanan" v={d.complaint.hours} on={cd('hours')} ph="Contoh: Senin – Kamis : 07.00 – 15.30" tambah="+ Tambah jam pelayanan" />
      <p><small>Misalnya satu baris untuk Senin–Kamis dan satu baris untuk Jumat. Kosongkan jika belum ada; kotak tidak akan tampil.</small></p></div>
    <p><button className="btn p" onClick={simpan}>Simpan pengaturan</button></p>
    <div className="card"><h3>Akun admin</h3><div className="g"><F l="Kata sandi baru (min. 8 karakter)" type="password" v={pw} on={setPw} /></div>
      <p><button className="btn" onClick={gantiPw}>Ganti kata sandi</button></p></div>
  </>
}
