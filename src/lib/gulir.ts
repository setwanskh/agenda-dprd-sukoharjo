/**
 * Menentukan posisi gulir daftar agenda.
 * - overflow: selisih tinggi isi dan tinggi area tampil (<= 1 berarti semua muat, tidak perlu menggulir).
 * - offsetAktif: posisi atas agenda pertama yang belum selesai (null jika semua sudah selesai).
 * Agenda selesai di atasnya ikut tergulir keluar sehingga tertutup oleh agenda berlangsung / akan datang.
 */
export function targetGulir(offsetAktif: number | null, overflow: number): number {
  if (overflow <= 1) return 0
  if (offsetAktif === null) return overflow   // semua selesai: tampilkan bagian paling bawah (terbaru)
  return Math.min(Math.max(offsetAktif, 0), overflow)
}

/** Lama menggulir (ms): kira-kira 40 piksel per detik, minimal 3 detik. */
export const durasiGulir = (jarak: number) => Math.max(3000, jarak * 25)
