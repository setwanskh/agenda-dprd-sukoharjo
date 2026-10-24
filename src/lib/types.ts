export type StatusAgenda = 'akan_datang' | 'berlangsung' | 'selesai'

export interface Agenda {
  id: string
  agenda_date: string        // YYYY-MM-DD (tanggal WIB)
  activity_type: string      // nama jenis disimpan sebagai salinan agar riwayat aman
  title: string
  detail: string | null
  origin: string | null
  start_time: string         // HH:MM:SS
  end_time: string | null
  room_name: string | null
  note: string | null
}

export interface Master { id: string; name: string; active: boolean; sort: number }
