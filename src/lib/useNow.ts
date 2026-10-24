import { useEffect, useState } from 'react'
import { wib } from './waktu'

/** Memperbarui waktu WIB setiap detik tanpa memuat ulang halaman. */
export function useNow() {
  const [now, setNow] = useState(() => wib())
  useEffect(() => {
    const t = setInterval(() => setNow(wib()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}
