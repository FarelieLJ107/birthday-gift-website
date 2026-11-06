# QR Feature — Testing

Dokumen ini mencatat apa yang **sudah** diuji untuk fitur QR Gift & QR Scanner, dengan alat apa,
dan apa yang **belum** diuji. Tes otomatis dijalankan di cloud workspace (Linux, Chromium headless)
pada 6 November 2026 dengan URL tujuan `https://farelielj107.github.io/birthday-gift-website/`
(QR versi 6, 41×41 modul, error correction H, quiet zone 4).

> **Uji di HP fisik:** pemilik website memindai gambar QR hati (PNG 1000 px yang dihasilkan
> website) dengan **Google Lens** di HP-nya, dan link **berhasil terbuka langsung ke website** ✅.
> Jenis HP tidak dicatat. Kamera bawaan Android/iPhone, WhatsApp, dan scanner internal website
> belum diuji di HP; lihat checklist di bagian akhir.

---

## 1. QR generator & file unduhan

Diuji dengan Playwright (emulasi iPhone 13) pada halaman `#qr`.

| Tes | Hasil |
|---|---|
| QR hati & standar terbentuk dari `destinationUrl` di config | ✅ |
| Verifikasi otomatis di halaman ("Scannable — decoded in your browser with jsQR") untuk hati, hati transparan, standar | ✅ |
| Download PNG 1000 px → `birthday-gift-heart-qr.png` | ✅ |
| Download PNG 2000 px → `birthday-gift-heart-qr-2000.png` | ✅ |
| Download PNG transparan (hati & standar) | ✅ |
| Download SVG (hati & standar) | ✅ |
| Copy Link → clipboard berisi URL yang benar | ✅ |
| Share tanpa Web Share API → link disalin + PNG diunduh (fallback) | ✅ |
| Share **dengan** Web Share API (sheet bawaan HP) | ⬜ belum diuji (Chromium headless tidak punya Web Share) |
| Tidak ada horizontal overflow, tidak ada error JavaScript | ✅ |

## 2. Dibaca oleh decoder lain (bukan hanya jsQR)

File PNG/SVG hasil tombol Download dibaca oleh dua decoder independen:
**ZXing-C++** (keluarga mesin yang dipakai banyak aplikasi scanner Android) dan **OpenCV
QRCodeDetector**. SVG dirender ke PNG dengan Chromium terlebih dahulu.

Tiap file diuji dalam 9 kondisi: ukuran asli; diperkecil 50%, 30%, 20%; blur (radius 2 pada
600 px); kompresi JPEG kualitas 35 (mirip kiriman WhatsApp); diputar 20°; perspektif miring;
redup + cahaya tidak rata + noise.

| File | ZXing-C++ | OpenCV |
|---|---|---|
| heart 1000 px | 9/9 | 8/9 (gagal: blur) |
| heart 2000 px | 9/9 | 8/9 (gagal: blur) |
| heart SVG | 9/9 | 7/9 (gagal: 180 px, blur) |
| heart transparan di atas putih | 9/9 | 8/9 (gagal: blur) |
| heart transparan di atas pink muda | 9/9 | 8/9 (gagal: blur) |
| heart transparan di atas warna gelap | 9/9 | 7/9 (gagal: 400 px, blur) |
| standar 1000 px | 9/9 | 7/9 (gagal: JPEG, perspektif) |
| standar SVG | 9/9 | 8/9 (gagal: perspektif) |
| standar transparan di atas putih | 9/9 | 7/9 (gagal: JPEG, perspektif) |
| standar transparan di atas warna gelap | 9/9 | 0/9, memang tidak layak; halaman memberi peringatan |
| **Total** | **90/90** | **68/90** |

**Temuan selama pengujian:** desain awal memakai finder pattern yang sangat membulat.
ZXing tetap bisa membacanya, tetapi OpenCV gagal pada **semua** versi hati (22/90). Setelah
finder dikembalikan ke bentuk hampir kotak dan kartu QR diperbesar menjadi ±47% lebar gambar,
hasil OpenCV naik ke 68/90. Kegagalan OpenCV yang tersisa adalah kasus berat (blur kuat di
ukuran kecil) yang juga terjadi pada QR standar.

## 3. Scanner kamera real-time

Diuji dengan Chromium memakai **kamera palsu** (`--use-file-for-fake-video-capture`). Kameranya
berupa video 1280×720 berisi QR hati yang dimiringkan di atas meja, dengan blur dan noise.

| Tes | Hasil |
|---|---|
| Kamera mati sebelum Start Camera ditekan | ✅ |
| QR terdeteksi real-time dengan URL yang benar | ✅ |
| Badge "This is your birthday gift" dan domain berlabel aman (gembok) | ✅ |
| Tombol Open Link & Scan Again muncul; link **tidak** dibuka otomatis | ✅ |
| Kamera berhenti setelah QR terbaca | ✅ |
| Scan Again menyalakan kamera lagi dan mendeteksi lagi | ✅ |
| Stop Camera menghentikan semua track (`MediaStreamTrack.stop()` terpanggil) | ✅ |
| Meninggalkan halaman scanner (termasuk saat izin kamera masih ditunggu) mematikan kamera | ✅ |
| Izin ditolak (`NotAllowedError`) → pesan jelas, tombol kembali normal | ✅ (error disimulasikan) |
| Tidak ada kamera (`NotFoundError`) → pesan + saran upload | ✅ (disimulasikan) |
| Kamera dipakai aplikasi lain (`NotReadableError`) → pesan | ✅ (disimulasikan) |
| Browser tanpa API kamera → pesan + saran upload | ✅ (disimulasikan) |
| `BarcodeDetector` dipakai jika tersedia | ✅ dengan detector tiruan; Chromium Linux tidak punya BarcodeDetector |
| `BarcodeDetector` error / tidak mendukung QR → otomatis pindah ke jsQR | ✅ (kamera & upload) |
| Switch Camera (depan/belakang) | ⬜ belum diuji (kamera palsu hanya satu) |
| Kamera asli di Android Chrome / iPhone Safari / desktop | ⬜ belum diuji |

**Bug yang ditemukan dan diperbaiki saat pengujian:** frame kamera awalnya diperkecil ke 720 px
sebelum dibaca jsQR, sehingga QR yang dipegang agak jauh tidak terbaca. Sekarang frame
bergantian dibaca sebagai potongan tengah dengan resolusi asli dan frame penuh hingga 1280 px.

## 4. Upload gambar QR

| Tes | Hasil |
|---|---|
| Foto JPG QR hati (miring, blur) | ✅ terbaca |
| WEBP QR hati | ✅ terbaca |
| Gambar tanpa QR → "No QR code found…" | ✅ |
| File bukan gambar → ditolak dengan pesan | ✅ |
| Kamera tetap mati selama upload | ✅ |

## 5. Validasi URL & keamanan

| Isi QR | Perilaku | Hasil |
|---|---|---|
| `https://farelielj107.github.io/…` | Bisa dibuka, badge birthday gift, domain hijau | ✅ |
| `https://www.wikipedia.org/` | Bisa dibuka di tab baru (`noopener noreferrer`), tanpa badge | ✅ |
| `http://example.com/hello` | Bisa dibuka + peringatan "Not secure" | ✅ |
| `javascript:alert(document.cookie)` | **Diblokir**, tanpa tombol Open | ✅ |
| `data:text/html,<script>…` | **Diblokir** | ✅ |
| `JaVaScRiPt:…`, `␠javascript:…`, `vbscript:`, `file:`, `intent:`, `blob:`, `mailto:` | **Diblokir** | ✅ |
| `https://user:pw@evil.example/` | Peringatan login tersembunyi | ✅ |
| `https://xn--…` (punycode) | Peringatan domain mirip | ✅ |
| `www.example.com/page` (tanpa skema) | Ditampilkan sebagai teks, tidak dijadikan link | ✅ |
| Teks biasa | Ditampilkan sebagai teks + tombol Copy | ✅ |
| `autoRedirect: true` + URL situs lain | Tetap menunggu tombol | ✅ |
| `autoRedirect: true` + URL website sendiri | Terbuka otomatis setelah ±1,8 detik | ✅ |

## 6. Responsif & regresi

- Semua halaman (termasuk `#qr` dan `#scan`) tanpa horizontal overflow di 360, 390
  (iPhone 13), 768, dan 1440 px. ✅
- Seluruh alur website lama (intro → home → memories → lightbox → detail → moments →
  reasons → letter → surprise → musik) masih berjalan tanpa error JavaScript. ✅
- Bug lama yang ikut diperbaiki:
  1. Membuka link langsung ke halaman tertentu (misalnya `#qr` atau `#surprise`) membuat
     halaman intro tetap aktif di lapisan bawah dan menghalangi klik.
  2. Halaman Memories melebar 21 px di layar 360 px karena judul kenangan yang panjang.

---

## Checklist uji di HP

Fitur QR sudah live di GitHub Pages (`https://`), jadi semua uji di bawah, termasuk scanner
kamera internal, bisa dilakukan sekarang. Gunakan QR yang **diunduh** dari halaman `#qr`, lalu
tampilkan di layar lain atau cetak.

| # | Uji | Heart | Standard |
|---|---|---|---|
| 1 | Google Lens | ✅ website terbuka langsung (jenis HP tidak dicatat) | ⬜ |
| 2 | Kamera bawaan Android | ⬜ | ⬜ |
| 3 | Kamera iPhone | ⬜ | ⬜ |
| 4 | Scanner QR di WhatsApp | ⬜ | ⬜ |
| 5 | QR yang dikirim lewat WhatsApp lalu di-scan dari galeri (Google Lens) | ⬜ | ⬜ |
| 6 | Scanner internal website: kamera belakang (Android Chrome) | ⬜ | ⬜ |
| 7 | Scanner internal website: kamera belakang (iPhone Safari) | ⬜ | ⬜ |
| 8 | Switch Camera depan ↔ belakang | ⬜ | — |
| 9 | Tolak izin kamera → pesan muncul; izinkan lagi via pengaturan browser | ⬜ | — |
| 10 | Upload QR Image dari galeri HP | ⬜ | ⬜ |
| 11 | QR dicetak kecil (±3 cm) dan besar (±10 cm) | ⬜ | ⬜ |
| 12 | Share QR lewat tombol Share (Web Share API) | ⬜ | — |

Jika QR hati gagal di salah satu aplikasi, pakai versi **Standard** dan catat aplikasi serta
kondisinya (jarak, cahaya, ukuran cetak).

## Menjalankan ulang tes otomatis

Skrip tes (Playwright, Python ZXing-C++/OpenCV) dijalankan di workspace sementara dan tidak
disertakan di repository, karena website ini sengaja tidak punya dependensi build. Cara paling
sederhana mengulang tes utama:

1. `python3 -m http.server 8000`, lalu buka `http://localhost:8000/#qr`. Status
   "Scannable" harus muncul untuk Heart dan Standard.
2. Buka `http://localhost:8000/#scan`, klik **Upload QR Image**, lalu pilih file QR yang
   baru diunduh. URL yang benar harus muncul. Di `localhost`, scanner kamera juga bisa dicoba
   memakai webcam.
