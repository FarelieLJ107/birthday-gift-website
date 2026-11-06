# birthday-gift-website
Interactive Romantic Birthday Gift Website

> **A Little Book About You — An Interactive Birthday Experience.**
> Website hadiah ulang tahun berbentuk aplikasi scrapbook digital: mobile-first,
> interaktif, dan seluruh isinya dipersonalisasi dari **satu file** (`js/config.js`).

Dibuat dengan HTML5, CSS3, dan Vanilla JavaScript. Tanpa framework, backend, database,
atau API berbayar. Cukup buka `index.html` di browser.

---

## Isi website

| # | Halaman | Route | Interaksi |
|---|---------|-------|-----------|
| 01 | Intro / Welcome | `#intro` | Hati melayang, animasi kado terbuka, transisi lingkaran ke halaman utama |
| 02 | Home / Dashboard | `#home` | Sapaan, hero foto, countdown ulang tahun, hitungan hari bersama, kartu navigasi, progres penjelajahan, carousel kenangan, catatan tulisan tangan |
| 03 | Our Memories | `#memories` | Grid polaroid dengan ukuran bervariasi, washi tape & stiker, chip filter, lightbox (prev/next, swipe, keyboard, Esc) |
| 04 | Memory Detail | `#memory/<id>` | Foto besar + thumbnail, judul, tanggal, lokasi, cerita, sticky note, favorit (♡), "More memories", tombol Next/Gallery |
| 05 | Little Moments | `#moments` | Timeline vertikal dengan polaroid & stiker, statistik hari bersama |
| 06 | Reasons Why I Love You | `#reasons` | 12 kartu yang bisa dibalik (flip), ledakan hati, progres, tombol "Surprise me", confetti saat semua terbuka |
| 07 | My Letter | `#letter` | Amplop terbuka, kertas surat bergaris, efek typewriter, "Show all", "Read again" |
| 08 | Birthday Surprise | `#surprise` | Kado bergetar & tutupnya terbang, confetti, hati & bintang, pesan, foto, kartu hadiah, tombol ke QR Gift |
| 09 | QR Gift: "A Little Secret" | `#qr` | QR berbentuk hati & QR standar yang berisi URL website, verifikasi scan otomatis, download PNG (1000/2000 px, transparan) & SVG, Share, Copy Link |
| 10 | QR Scanner: "Scan a QR Code" | `#scan` | Scanner kamera real-time (kamera depan/belakang), upload gambar QR, validasi & pemblokiran link berbahaya |

QR Gift bisa dibuka dari kartu **A Secret Message** di Home dan tombol **A secret message for you**
di halaman Surprise; scanner dibuka dari halaman QR Gift. Bottom navigation tetap 5 menu
(di halaman QR & Scanner, menu **Surprise** yang aktif).

Fitur global: bottom navigation (Home · Memories · Moments · Letter · Surprise), transisi
antarhalaman, scroll reveal, indikator progres scroll di atas layar, tombol kembali,
pemutar musik (play/pause), dukungan safe-area iPhone, dan mode `prefers-reduced-motion`.

---

## Struktur folder

```
birthday-gift-website/
├── index.html            ← semua halaman (single-page app, hash routing)
├── css/
│   ├── style.css         ← design system (token warna, font, radius) + komponen
│   ├── animations.css    ← keyframes, transisi halaman, micro-interactions
│   ├── qr.css            ← halaman QR Gift & QR Scanner
│   └── responsive.css    ← tablet & desktop "app preview"
├── js/
│   ├── config.js         ← ✏️ SATU-SATUNYA FILE YANG PERLU DIEDIT
│   ├── icons.js          ← ikon SVG inline (gaya Lucide, offline)
│   ├── utils.js          ← helper: tanggal, storage, placeholder gambar, toast
│   ├── animations.js     ← hati melayang, confetti, typewriter, scroll reveal
│   ├── navigation.js     ← router (#home, #memories, …) + bottom nav
│   ├── gallery.js        ← galeri, filter, lightbox, halaman detail
│   ├── qr-generator.js   ← QR hati + QR standar, PNG/SVG, share, copy link
│   ├── qr-scanner.js     ← kamera real-time, upload gambar, validasi URL
│   ├── main.js           ← render semua halaman, surat, kejutan, musik
│   └── vendor/           ← library QR open-source (disimpan lokal, tanpa CDN)
│       ├── qrcode-generator.min.js   (MIT, Kazuhiko Arase)
│       ├── jsQR.min.js               (Apache-2.0, dimuat hanya saat dibutuhkan)
│       └── LICENSE-jsQR.txt
├── docs/
│   └── QR-TESTING.md     ← hasil pengujian QR + checklist uji di HP
├── assets/
│   ├── images/           ← foto (saat ini berisi ilustrasi placeholder .svg)
│   ├── music/            ← taruh lagu kamu di sini (our-song.mp3)
│   ├── icons/            ← favicon
│   └── fonts/            ← opsional, untuk font offline
├── .nojekyll             ← agar GitHub Pages menyajikan file apa adanya
└── README.md
```

---

## Personalisasi (semua di `js/config.js`)

Buka `js/config.js`, ganti teks di dalam tanda kutip, simpan, lalu refresh browser.

### Nama & tanggal
```js
partner:  { name: "Aurelia", nickname: "Lia", photo: "assets/images/profile.jpg" },
sender:   { name: "Rafi" },
birthday: "1999-11-12",   // YYYY-MM-DD (tahun dipakai untuk "turning 27")
showAge:  true,           // false = sembunyikan umur
firstMet: "2023-02-14",   // untuk "1.359 days of us"
```

### Mengganti foto
1. Salin foto ke `assets/images/`, misalnya `pantai.jpg`.
   *Tips: kecilkan dulu ke lebar ±1200px agar website cepat dibuka di HP.*
2. Tulis path-nya di config: `photo: "assets/images/pantai.jpg"`.
3. Nama file **peka huruf besar/kecil** di GitHub Pages (`Pantai.JPG` ≠ `pantai.jpg`).

Jika path salah atau file belum ada, website otomatis menampilkan placeholder merah muda,
jadi tidak akan ada ikon gambar rusak.

### Kenangan (galeri + halaman detail)
Setiap item di `memories` punya: `id` (unik, tanpa spasi), `title`, `date`, `tag`
(untuk chip filter), `size` (`"normal"`, `"tall"`, `"wide"`), `photo`, `caption`, `story`,
`note` (catatan tulisan tangan), `location`, dan `extraPhotos` (foto tambahan, boleh `[]`).
Tambah atau hapus item sesuka hati; galeri, carousel di Home, dan jumlah foto ikut menyesuaikan.
Tambahkan `featured: true` pada item tertentu untuk memilih yang tampil di "Featured memories".

### Timeline, alasan, surat, kejutan
- `moments`: tanggal, judul, foto, cerita, `sticker` (heart, star, flower, sparkles, gift…).
  Isi `date: "today"` untuk otomatis memakai tanggal hari ini.
- `reasons`: `icon`, `title`, `description` (minimal 12 alasan sudah disediakan).
  Ikon yang tersedia: heart, smile, sun, coffee, moon, flower, star, sparkles, book,
  music, shield, feather, camera, gift.
- `letter`: `greeting`, `paragraphs` (array paragraf), `closing`, `signature`.
- `surprise`: `message`, `photo`, `giftTitle`, `giftDescription`, `giftNote`.

### Musik
1. Taruh lagu di `assets/music/our-song.mp3` (atau ubah `music.src`).
2. Musik **tidak pernah autoplay**. Musik mulai setelah penerima menekan "Open Your Gift"
   (atur `playOnGiftOpen: false` jika ingin hanya lewat tombol ♪), dan bisa di-pause kapan saja
   lewat tombol ♪ di pojok kanan atas.
3. Selama file belum ada, website memainkan melodi *music box* "Happy Birthday"
   yang dibuat langsung oleh browser (Web Audio). Matikan dengan `fallbackMelody: false`.

### Warna & font
Token desain ada di bagian atas `css/style.css` (`--primary`, `--secondary`, `--soft`, …).
Ubah satu variabel dan seluruh website ikut berubah.

---

## QR Gift — "A Secret Message Just For You"

QR berbentuk hati yang membuka website ini saat dipindai dengan Google Lens, kamera HP,
WhatsApp, atau aplikasi scanner lain. QR-nya **asli dan standar**: isinya URL website, bukan
gambar yang hanya mirip QR.

### Konfigurasi (`js/config.js` → `qrSettings`)

```js
qrSettings: {
  enabled: true,                       // false = sembunyikan semua tautan ke QR Gift
  destinationUrl: "https://farelielj107.github.io/birthday-gift-website/",
  redirectPage: "",                    // "" atau "index.html"
  redirectHash: "",                    // "" / "#intro" = halaman pembuka, "#surprise" = langsung ke kejutan
  autoRedirect: false,                 // lihat catatan keamanan di bawah
  scannerEnabled: true,                // false = sembunyikan tautan ke scanner
  allowCameraScanning: true,           // false = scanner hanya lewat upload gambar
  allowImageUpload: true,              // false = sembunyikan tombol Upload QR Image
  allowExternalScanner: true,          // tampilkan panduan scan via Google Lens / kamera
  design: {
    theme: "romantic-pink",
    style: "heart",                    // tampilan awal: "heart" atau "standard"
    foreground: "#D83F72",             // warna modul (harus cukup gelap)
    background: "#FFFFFF",             // background (harus terang)
    errorCorrection: "H",              // wajib H untuk QR hati
    size: 1000,                        // ukuran PNG default; ada pilihan 2000 px
    margin: 4,                         // quiet zone (minimal 4, nilai lebih kecil diabaikan)
    centerHeart: true                  // hati kecil di tengah QR
  }
}
```

- **Ganti `destinationUrl`** jika alamat website berubah (misalnya pindah ke Netlify).
  QR langsung dibuat ulang dari URL ini. Halaman QR menampilkan peringatan jika URL berupa
  `localhost`, alamat IP lokal, `http://`, atau masih placeholder (`username`).
- File QR yang sudah pernah diunduh **tidak ikut berubah**. Unduh ulang setelah mengganti URL.
- URL yang lebih pendek menghasilkan QR dengan modul lebih besar, sehingga lebih mudah dipindai.

### Cara QR hati tetap bisa dipindai

1. QR dibuat dengan error correction **H** (hingga 30% kode boleh rusak).
2. QR diletakkan di **kartu putih dengan quiet zone 4 modul**. Hati merah muda tidak pernah
   menyentuh kode.
3. **Finder pattern** (tiga kotak di sudut) mempertahankan proporsi standar dan hanya sedikit
   dibulatkan. Dalam pengujian, sudut yang sangat bulat membuat OpenCV gagal membaca.
4. Hati kecil di tengah menutupi ±3–4% modul dan hanya dipasang pada QR versi ≤ 6, agar tidak
   menimpa alignment pattern.
5. Setiap kali QR dibuat, website **membaca ulang gambar PNG-nya sendiri** di browser dan
   menampilkan status "Scannable" atau peringatan.
6. Jika ada scanner yang kesulitan, pilih **Standard** (QR kotak klasik tanpa dekorasi).

### Download & share

| Tombol | Hasil |
|---|---|
| Download PNG | `birthday-gift-heart-qr.png` (hati) / `birthday-gift-qr.png` (standar), 1000 px atau 2000 px (HD) |
| SVG | Versi vektor yang tajam di ukuran berapa pun, cocok untuk dicetak |
| Transparent background | Area di luar hati menjadi transparan (kartu QR tetap putih). Untuk QR standar, letakkan hanya di atas background terang |
| Share | Web Share API (mengirim gambar QR + link jika didukung). Di browser lain: link disalin dan PNG diunduh |
| Copy Link | Menyalin URL tujuan ke clipboard |

### QR Scanner ("Scan Your Little Surprise")

- **Kamera real-time:** kamera baru menyala setelah **Start Camera** ditekan, dengan kamera
  belakang sebagai prioritas. **Switch Camera** aktif jika perangkat punya lebih dari satu
  kamera. Kamera dimatikan saat menekan Stop, setelah QR terbaca, saat meninggalkan halaman
  scanner, dan saat tab disembunyikan.
- **Mesin pembaca:** memakai `BarcodeDetector` bawaan browser bila tersedia (misalnya Chrome
  Android), dengan cadangan otomatis **jsQR** (iPhone Safari, Firefox, dan browser lain).
- **Upload QR Image:** PNG, JPG, JPEG, atau WEBP dari galeri. Tidak butuh izin kamera, dan di
  desktop bisa juga dengan drag & drop.
- **Privasi:** semua gambar diproses di HP/komputer pengguna. Tidak ada yang diunggah ke
  server, dan hasil scan tidak disimpan.
- **Kamera butuh HTTPS.** `getUserMedia` hanya jalan di halaman `https://` (GitHub Pages atau
  Netlify) atau `localhost`. Jika website dibuka langsung dari file, scanner kamera
  menampilkan pesan, sedangkan upload gambar tetap berfungsi.

### Keamanan hasil scan

- Link **tidak pernah dibuka otomatis**. Pengguna harus menekan **Open Link**.
- Hanya `https://` dan `http://` yang bisa dibuka; `http://` diberi label "Not secure".
- `javascript:`, `data:`, `vbscript:`, `file:`, `blob:`, `intent:`, dan skema lain **diblokir**
  (tidak peka huruf besar/kecil maupun spasi di depan).
- Domain tujuan ditampilkan jelas sebelum dibuka, dengan peringatan untuk link yang
  menyembunyikan login (`user:pass@`) atau domain dengan karakter mirip (`xn--`).
- Link ke situs lain dibuka di tab baru dengan `rel="noopener noreferrer"`.
- `autoRedirect: true` hanya berlaku untuk **URL website ini sendiri** (https). Link lain
  tetap menunggu tombol.

Hasil pengujian lengkap dan checklist uji di HP ada di [`docs/QR-TESTING.md`](docs/QR-TESTING.md).

---

## Menjalankan secara lokal

**Cara tercepat:** klik dua kali `index.html`. Semua fitur berjalan langsung dari file.

**Dengan server lokal** (disarankan, mirip kondisi hosting):
```bash
cd birthday-gift-website
python3 -m http.server 8000
# buka http://localhost:8000
```
Alternatif: `npx serve .` atau ekstensi *Live Server* di VS Code.

Untuk membuka di HP dalam jaringan Wi-Fi yang sama, buka `http://<IP-komputer>:8000`.

---

## Deploy gratis ke GitHub Pages

1. Pastikan semua perubahan sudah di-merge ke branch **`main`**.
2. Buka repository di GitHub → **Settings** → **Pages**.
3. Di **Build and deployment** → *Source*: pilih **Deploy from a branch**.
4. *Branch*: pilih **`main`** dan folder **`/ (root)`**, lalu **Save**.
5. Tunggu 1–2 menit. Website tersedia di
   `https://<username>.github.io/birthday-gift-website/`.

Semua path di proyek ini relatif (`css/…`, `js/…`, `assets/…`), jadi langsung jalan di
sub-folder GitHub Pages. File `.nojekyll` sudah disertakan.

> **Privasi:** GitHub Pages pada akun gratis membutuhkan repository **public**, sehingga foto
> dan surat bisa dilihat siapa pun yang tahu link-nya. Periksa foto pribadi sebelum publish.
> Alternatif: **Netlify Drop** (https://app.netlify.com/drop): seret folder proyek ke halaman
> itu dan kamu langsung mendapat link, tanpa perlu repository public.

---

## Catatan teknis

- **Tanpa dependensi.** Satu-satunya request eksternal adalah Google Fonts; tanpa internet
  website tetap jalan dengan font cadangan.
- **Aksesibilitas:** semua kontrol berupa `<button>`/`<a>` dengan label, fokus keyboard terlihat,
  lightbox punya focus trap + Esc, `aria-current` di navigasi, dan animasi dikurangi saat
  `prefers-reduced-motion` aktif.
- **Penyimpanan lokal:** halaman yang sudah dikunjungi, alasan yang sudah dibuka, dan favorit
  disimpan di `localStorage` browser penerima (aman jika diblokir, website tetap berjalan).
- **Responsif:** desain utama 360–430px; tablet 768px memakai kolom tengah yang lebih lega;
  desktop ≥1024px menampilkan website sebagai *app preview* berbentuk ponsel di tengah layar.
- **Keamanan:** tidak ada API key, token, atau kredensial. Semua teks dari config di-escape
  sebelum dirender.
