import { useMemo } from 'react'
import qrcode from 'qrcode-generator'

/** QR asli dari URL yang diatur admin. Hanya http/https yang dibuatkan QR. */
export default function Qr({ url }: { url: string }) {
  const svg = useMemo(() => {
    if (!/^https?:\/\//i.test(url)) return ''
    try { const q = qrcode(0, 'M'); q.addData(url); q.make(); return q.createSvgTag(4, 8) } catch { return '' }
  }, [url])
  if (!svg) return null
  return <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
}
