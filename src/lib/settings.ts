export type ThemeKey = 'mhe' | 'me' | 'mh' | 'mt' | 'kr' | 'ab' | 'hj' | 'nv' | 'mp' | 'ky' | 'bl' | 'hm' | 'oh' | 'ts'

export interface Settings {
  org: string
  theme: ThemeKey
  duration: number
  show: { akan_datang: boolean; berlangsung: boolean; selesai: boolean; showDone: boolean }
  surveyTitle: string; surveyNote: string; surveyUrl: string; surveyOn: boolean
  logoLeft: string; logoRight: string; logoRightOn: boolean
  complaint: { phone: string; email: string[]; site: string[]; hours: string[]; note: string; youtube: string; instagram: string; facebook: string; tiktok: string }
}

export const DEFAULTS: Settings = {
  org: 'DPRD KABUPATEN SUKOHARJO', theme: 'mhe', duration: 60,
  show: { akan_datang: true, berlangsung: true, selesai: true, showDone: true },
  surveyTitle: 'SURVEI KEPUASAN PELAYANAN TAHUN 2026', surveyNote: 'Pindai QR code untuk mengisi survei', surveyUrl: '', surveyOn: true,
  logoLeft: '', logoRight: '', logoRightOn: true,
  complaint: { phone: '', email: [], site: [], hours: [], note: '', youtube: '', instagram: '', facebook: '', tiktok: '' },
}

/** Nilai lama berupa satu teks otomatis menjadi daftar; daftar dibersihkan dari isi non-teks. */
const daftar = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : typeof v === 'string' && v ? [v] : []

/** Menggabungkan data database dengan nilai bawaan agar kolom yang belum ada tidak membuat error. */
export function mergeSettings(raw: unknown): Settings {
  const r = (raw ?? {}) as Record<string, unknown>
  const c = (r.complaint ?? {}) as Record<string, unknown>
  return {
    ...DEFAULTS, ...(r as Partial<Settings>),
    show: { ...DEFAULTS.show, ...(r.show as Partial<Settings['show']>) },
    complaint: { ...DEFAULTS.complaint, ...(c as Partial<Settings['complaint']>), email: daftar(c.email), site: daftar(c.site), hours: daftar(c.hours) },
  }
}

const gelap = (t1: string, t2: string, t3: string, ac: string) => ({
  '--t1': t1, '--t2': t2, '--t3': t3, '--ac': ac, '--tx': '#F8F5EF', '--tx2': '#D5CDD0',
  '--pn': 'rgba(13,13,15,.6)', '--rw': 'rgba(23,23,25,.8)', '--rwon': 'rgba(198,161,91,.18)', '--onac': '#0D0D0F', '--bd': 'rgba(198,161,91,.4)',
})

const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})` }
const terang = (t1: string, t2: string, t3: string, ac: string, tx: string, tx2: string) => ({
  '--t1': t1, '--t2': t2, '--t3': t3, '--ac': ac, '--tx': tx, '--tx2': tx2,
  '--pn': 'rgba(255,255,255,.8)', '--rw': 'rgba(255,255,255,.95)', '--rwon': rgba(ac, 0.13), '--onac': '#FFFFFF', '--bd': rgba(ac, 0.4),
})

export const THEMES: Record<ThemeKey, { label: string; vars: Record<string, string> }> = {
  mhe: { label: 'Merah–Hitam–Emas (bawaan)', vars: gelap('#641C28', '#3A1018', '#0D0D0F', '#C6A15B') },
  me:  { label: 'Merah–Emas', vars: gelap('#641C28', '#3A1018', '#641C28', '#C6A15B') },
  mh:  { label: 'Merah–Hitam', vars: gelap('#641C28', '#171719', '#0D0D0F', '#D5CDD0') },
  mt:  { label: 'Marun Terang', vars: {
    '--t1': '#8C3446', '--t2': '#6E2434', '--t3': '#4A1623', '--ac': '#E2C48A', '--tx': '#FFF8EE', '--tx2': '#F0DCDC',
    '--pn': 'rgba(58,16,24,.55)', '--rw': 'rgba(58,16,24,.6)', '--rwon': 'rgba(226,196,138,.25)', '--onac': '#3A1018', '--bd': 'rgba(226,196,138,.5)' } },
  kr:  { label: 'Krem–Marun (terang)', vars: {
    '--t1': '#FBF7EF', '--t2': '#F1E8D8', '--t3': '#E6D8C0', '--ac': '#8A6420', '--tx': '#3A1018', '--tx2': '#6B4A4F',
    '--pn': 'rgba(255,255,255,.75)', '--rw': 'rgba(255,255,255,.92)', '--rwon': 'rgba(198,161,91,.3)', '--onac': '#FFFFFF', '--bd': 'rgba(138,100,32,.5)' } },
  ab:  { label: 'Abu–Marun (terang)', vars: {
    '--t1': '#ECE7E8', '--t2': '#D5CDD0', '--t3': '#BDB2B6', '--ac': '#641C28', '--tx': '#2A0D14', '--tx2': '#5A4448',
    '--pn': 'rgba(255,255,255,.7)', '--rw': 'rgba(255,255,255,.9)', '--rwon': 'rgba(100,28,40,.14)', '--onac': '#FFFFFF', '--bd': 'rgba(100,28,40,.45)' } },
  hj:  { label: 'Hijau Zamrud–Emas', vars: gelap('#0F4D3A', '#0A3328', '#05140F', '#D4B26A') },
  nv:  { label: 'Biru Navy–Emas', vars: gelap('#1B3A6B', '#11284D', '#070F1F', '#D9B563') },
  mp:  { label: 'Merah Putih (terang)', vars: {
    '--t1': '#FFFFFF', '--t2': '#FBF3F3', '--t3': '#F2DEDF', '--ac': '#B3141F', '--tx': '#2B0A0D', '--tx2': '#6A4A4D',
    '--pn': 'rgba(255,255,255,.8)', '--rw': 'rgba(255,255,255,.95)', '--rwon': 'rgba(179,20,31,.12)', '--onac': '#FFFFFF', '--bd': 'rgba(179,20,31,.45)' } },
  ky:  { label: 'Kuning–Merah, selaras lambang (terang)', vars: {
    '--t1': '#FFF8DC', '--t2': '#FBEBB0', '--t3': '#F0D98A', '--ac': '#A3151E', '--tx': '#4A0E14', '--tx2': '#6E4A3A',
    '--pn': 'rgba(255,255,255,.75)', '--rw': 'rgba(255,255,255,.9)', '--rwon': 'rgba(163,21,30,.14)', '--onac': '#FFFFFF', '--bd': 'rgba(163,21,30,.45)' } },
  bl:  { label: 'Biru Langit (cerah)', vars: terang('#F4F9FF', '#DCEBFA', '#C3DCF5', '#1D5FA8', '#0F2A4A', '#43607F') },
  hm:  { label: 'Hijau Mint (cerah)', vars: terang('#F3FBF6', '#DDF2E4', '#C5E8D1', '#1E7A4A', '#0E2E1D', '#3F6652') },
  oh:  { label: 'Oranye Hangat (cerah)', vars: terang('#FFF8F0', '#FDE6CF', '#F9D2AC', '#B5500E', '#3B1A08', '#6B4A35') },
  ts:  { label: 'Tosca (cerah)', vars: terang('#F1FBFB', '#D5F0F0', '#B9E4E4', '#0E7C86', '#0A2E32', '#3C6468') },
}
