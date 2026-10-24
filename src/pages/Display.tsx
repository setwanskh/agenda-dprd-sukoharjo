import { configured } from '../lib/supabase'
import { useNow } from '../lib/useNow'
import { useDisplayData } from '../lib/useDisplayData'
import { THEMES } from '../lib/settings'
import { hitungStatus, urutkan } from '../lib/waktu'
import Qr from '../components/Qr'
import Ikon from '../components/Ikon'
import '../display.css'

const LABEL = { akan_datang: 'AKAN DATANG', berlangsung: 'SEDANG BERLANGSUNG', selesai: 'SELESAI' } as const
const jam = (t: string) => t.slice(0, 5).replace(':', '.')

function layarPenuh() {
  try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen() } catch { /* diblokir browser */ }
}

export default function Display() {
  const now = useNow()
  const { agendas, settings: s, online } = useDisplayData(now.tanggal)

  if (!configured) return <div className="disp"><div className="msg">File <code>.env</code> belum diisi. Lihat README.</div></div>

  const vars = (THEMES[s.theme] ?? THEMES.mhe).vars as React.CSSProperties
  const rows = urutkan(agendas)
    .map(a => ({ ...a, st: hitungStatus(a.start_time, a.end_time, now.menit, s.duration) }))
    .filter(a => s.show.showDone || a.st !== 'selesai')
  const c = s.complaint
  const adaPengaduan = Boolean(c.phone || c.email || c.site || c.hours.length || c.note || c.youtube || c.instagram || c.facebook || c.tiktok)
  const adaSurvei = s.surveyOn && /^https?:\/\//i.test(s.surveyUrl)
  const dens = rows.length > 11 ? 'dense vdense' : rows.length > 7 ? 'dense' : ''

  return (
    <div className="disp" style={vars}>
      <div className="hd">
        <div className="l">{s.logoLeft && <img src={s.logoLeft} alt="" />}</div>
        <div className="c">
          <h1>{s.org}</h1>
          <h2>AGENDA HARI INI</h2>
          <div className="dt">{now.panjang}</div>
          <div className="clk">{now.jam} WIB</div>
        </div>
        <div className="r">{s.logoRight && s.logoRightOn && <img src={s.logoRight} alt="" />}</div>
      </div>

      <div className={'main' + (adaSurvei || adaPengaduan ? '' : ' one')}>
        <div className={'list ' + dens}>
          {rows.length === 0 && <div className="empty">BELUM ADA AGENDA HARI INI</div>}
          {rows.length > 0 && (
            <div className="row rowh"><span>No</span><span>Agenda</span><span>Waktu</span><span>Tempat</span><span>Status</span></div>
          )}
          {rows.map((a, i) => (
            <div key={a.id} className={'row ' + a.st}>
              <span>{i + 1}</span>
              <div>
                <span className="jn">{a.activity_type}{a.origin ? ' · ' + a.origin : ''}</span>
                <span className="nm">{a.title}{a.detail ? ' – ' + a.detail : ''}</span>
              </div>
              <span className="tm">{jam(a.start_time)}{a.end_time ? ' – ' + jam(a.end_time) : ''} WIB</span>
              <span>{a.room_name}</span>
              {s.show[a.st] ? <span className={'bd ' + a.st}>{LABEL[a.st]}</span> : <span />}
            </div>
          ))}
        </div>

        {(adaSurvei || adaPengaduan) && (
          <div className="side">
            {adaSurvei && (
              <div className="pn ctr"><h3>{s.surveyTitle}</h3><Qr url={s.surveyUrl} /><small>{s.surveyNote}</small></div>
            )}
            {adaPengaduan && (
              <div className="pn"><h3>INFORMASI DAN PENGADUAN</h3>
                {c.phone && <div className="ln"><Ikon n="phone" /><span>{c.phone}</span></div>}
                {c.email && <div className="ln"><Ikon n="email" /><span>{c.email}</span></div>}
                {c.site && <div className="ln"><Ikon n="web" /><span>{c.site}</span></div>}
                {c.hours.map((h, i) => <div className="ln" key={i}><Ikon n="clock" /><span>{h}</span></div>)}
                {c.youtube && <div className="ln"><Ikon n="youtube" /><span>{c.youtube}</span></div>}
                {c.instagram && <div className="ln"><Ikon n="instagram" /><span>{c.instagram}</span></div>}
                {c.facebook && <div className="ln"><Ikon n="facebook" /><span>{c.facebook}</span></div>}
                {c.tiktok && <div className="ln"><Ikon n="tiktok" /><span>{c.tiktok}</span></div>}
                {c.note && <div className="nt">{c.note}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ft">
        <span>{online ? '● Terhubung' : '○ Koneksi terputus – menampilkan data terakhir'}</span>
        <button onClick={layarPenuh}>Layar Penuh</button>
      </div>
    </div>
  )
}
