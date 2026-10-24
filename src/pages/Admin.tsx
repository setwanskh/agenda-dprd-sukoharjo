import { useState } from 'react'
import { useAdmin } from '../auth/useAdmin'
import { useNow } from '../lib/useNow'
import { configured, supabase } from '../lib/supabase'
import { hitungStatus, urutkan } from '../lib/waktu'
import { useAdminData } from '../admin/useAdminData'
import { NotifyProvider } from '../admin/ui'
import AgendaPage from '../admin/Agenda'
import MasterPage from '../admin/Master'
import Pengaturan from '../admin/Pengaturan'
import Laporan from '../admin/Laporan'
import '../admin.css'

const TABS = [['dash', 'Dashboard'], ['agenda', 'Kelola Agenda'], ['jenis', 'Master Jenis Kegiatan'], ['ruang', 'Master Ruang dan Tempat'], ['laporan', 'Laporan Tahunan'], ['set', 'Pengaturan']] as const
type Tab = typeof TABS[number][0]

function Login() {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('')
  const masuk = async () => { setErr(''); const { error } = await supabase.auth.signInWithPassword({ email, password: pw }); if (error) setErr('Email atau kata sandi salah.') }
  return <div className="adm"><div className="card login"><h3>Login Admin</h3>
    <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>Kata sandi<input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && masuk()} /></label>
    {err && <p style={{ color: '#ff8a8a' }}>{err}</p>}<p><button className="btn p" onClick={masuk}>Masuk</button></p></div></div>
}

function Dashboard({ data }: { data: ReturnType<typeof useAdminData> }) {
  const now = useNow()
  const hari = data.agendas.filter(a => a.agenda_date === now.tanggal)
  const st = (a: typeof hari[number]) => hitungStatus(a.start_time, a.end_time, now.menit, data.settings.duration)
  const jalan = hari.filter(a => st(a) === 'berlangsung')
  const next = urutkan(hari).find(a => st(a) === 'akan_datang')
  return <div className="cards">
    <div className="card">Agenda hari ini<b>{hari.length}</b></div>
    <div className="card">Sedang berlangsung<b>{jalan.length}</b>{jalan.map(a => a.title).join(', ')}</div>
    <div className="card">Agenda berikutnya<b style={{ fontSize: '1.1rem' }}>{next ? next.title : '-'}</b>{next ? next.start_time.slice(0, 5) + ' WIB' : ''}</div>
    <div className="card">Agenda mendatang<b>{data.agendas.filter(a => a.agenda_date > now.tanggal).length}</b></div></div>
}

export default function Admin() {
  const { loading, session, isAdmin } = useAdmin()
  if (!configured) return <div className="adm"><div className="card login">File <code>.env</code> belum diisi. Lihat README.</div></div>
  if (loading) return <div className="adm"><div className="card login">Memuat…</div></div>
  if (!session) return <Login />
  if (!isAdmin) return <div className="adm"><div className="card login"><p>Akun ini belum terdaftar sebagai admin. Lihat README, langkah "Daftarkan admin".</p>
    <button className="btn" onClick={() => supabase.auth.signOut()}>Keluar</button></div></div>
  return <NotifyProvider><Panel /></NotifyProvider>
}

function Panel() {
  const now = useNow(); const data = useAdminData(); const [tab, setTab] = useState<Tab>('dash')
  return <div className="adm">
    <header><div><h1>Dashboard Agenda Kantor</h1><div className="adt">{now.panjang}</div></div>
      <div><div className="adc">{now.jam} WIB</div><a className="btn" href="/" target="_blank" rel="noreferrer">Lihat Display</a> <button className="btn" onClick={() => supabase.auth.signOut()}>Keluar</button></div></header>
    <div className="nav">{TABS.map(([k, l]) => <button key={k} className={'btn' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>)}
      <span style={{ marginLeft: 'auto' }}>{data.online ? '● Database terhubung' : '○ Database terputus'}</span></div>
    {!data.ready ? <div className="card">Memuat data…</div> : <>
      {tab === 'dash' && <Dashboard data={data} />}
      {tab === 'agenda' && <AgendaPage agendas={data.agendas} types={data.types} rooms={data.rooms} reload={data.reload} />}
      {tab === 'jenis' && <MasterPage tabel="activity_types" judul="Master Jenis Kegiatan" items={data.types} reload={data.reload} />}
      {tab === 'ruang' && <MasterPage tabel="meeting_rooms" judul="Master Ruang dan Tempat" items={data.rooms} reload={data.reload} />}
      {tab === 'laporan' && <Laporan agendas={data.agendas} org={data.settings.org} reload={data.reload} />}
      {tab === 'set' && <Pengaturan settings={data.settings} reload={data.reload} />}</>}
  </div>
}
