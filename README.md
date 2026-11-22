# birthday-gift-website
Interactive Romantic Birthday Gift Website

> **Buku Kecil Tentangmu — Pengalaman Ulang Tahun Interaktif.**
> Website hadiah ulang tahun berbentuk aplikasi scrapbook digital: mobile-first,
> interaktif, dan seluruh isinya dipersonalisasi dari **satu file** (`js/config.js`).
> Seluruh tampilan website berbahasa Indonesia.

Dibuat dengan HTML5, CSS3, dan Vanilla JavaScript. Tanpa framework, backend, database,
atau API berbayar. Cukup buka `index.html` di browser.

---

## Isi website

| # | Halaman | Route | Interaksi |
|---|---------|-------|-----------|
| 01 | Pembuka | `#intro` | Hati melayang, animasi kado terbuka, transisi lingkaran ke halaman utama |
| 02 | Beranda | `#home` | Sapaan, hero foto, countdown ulang tahun, hitungan hari bersama, kartu navigasi, progres penjelajahan, carousel kenangan, catatan tulisan tangan |
| 03 | Kenangan Kita | `#memories` | Grid polaroid dengan ukuran bervariasi, washi tape & stiker, chip filter, lightbox (prev/next, swipe, keyboard, Esc) |
| 04 | Detail Kenangan | `#memory/<id>` | Foto besar + thumbnail, judul, tanggal, lokasi, cerita, sticky note, favorit (♡), "Kenangan lainnya", tombol Kenangan berikutnya/Galeri |
| 05 | Momen Kecil | `#moments` | Timeline vertikal dengan polaroid & stiker, statistik hari bersama |
| 06 | Alasan Aku Sayang Kamu | `#reasons` | 12 kartu yang bisa dibalik (flip), ledakan hati, progres, tombol "Kejutkan aku", confetti saat semua terbuka |
| 07 | Suratku | `#letter` | Amplop terbuka, kertas surat bergaris, efek typewriter, "Tampilkan semua", "Baca lagi" |
| 08 | Kejutan Ulang Tahun | `#surprise` | Kado bergetar & tutupnya terbang, confetti, hati & bintang, pesan, foto, kartu hadiah, tautan ke Misi/Kue/Hadiah |
| 09 | Misi Ulang Tahun | `#quest` | Mini treasure hunt 3 tahap: objek tersembunyi, trivia ringan, puzzle foto; 3 token + progress + final unlock |
| 10 | Kue Ulang Tahun | `#cake` | Kue dengan lilin menyala, Buat Permohonan, Tiup Lilinnya (tombol, tanpa mikrofon), confetti + ucapan, nyalakan lagi |
| 11 | Hadiah Ulang Tahunmu | `#gifts` | 4 kotak hadiah (pesan lucu, foto, voice note, surat final), animasi buka, bisa dibuka ulang; hadiah terakhir terbuka setelah Misi selesai |

Misi, Kue, dan Hadiah dibuka dari kartu di grid **Buka halaman** (Beranda) dan dari tautan
**Tiup lilinnya · Buka hadiahmu · Misi Ulang Tahun** di halaman Kejutan.

Bottom navigation tetap 5 menu; di halaman Misi, Kue, dan Hadiah, menu **Kejutan** yang aktif.

Fitur global: bottom navigation (Beranda · Kenangan · Momen · Surat · Kejutan), transisi
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
│   ├── party.css         ← Birthday Quest, Birthday Cake, Gift collection
│   └── responsive.css    ← tablet & desktop "app preview"
├── js/
│   ├── config.js         ← ✏️ SATU-SATUNYA FILE YANG PERLU DIEDIT
│   ├── icons.js          ← ikon SVG inline (gaya Lucide, offline)
│   ├── utils.js          ← helper: tanggal, storage, placeholder gambar, toast
│   ├── animations.js     ← hati melayang, confetti, typewriter, scroll reveal
│   ├── navigation.js     ← router (#home, #memories, …) + bottom nav
│   ├── gallery.js        ← galeri, filter, lightbox, halaman detail
│   ├── quest.js          ← Birthday Quest: token, objek tersembunyi, trivia, puzzle
│   ├── cake.js           ← kue interaktif (wish → tiup lilin → perayaan)
│   ├── gifts.js          ← koleksi kado, modal isi kado, kunci gift terakhir
│   └── main.js           ← render semua halaman, surat, kejutan, musik
├── assets/
│   ├── images/           ← foto (saat ini berisi ilustrasi placeholder .svg)
│   ├── music/            ← taruh lagu kamu di sini (our-song.mp3)
│   ├── audio/            ← voice note untuk Gift 03 (birthday-message.mp3)
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
Tambahkan `featured: true` pada item tertentu untuk memilih yang tampil di "Kenangan pilihan".

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
2. Musik **tidak pernah autoplay**. Musik mulai setelah penerima menekan "Buka Hadiahmu"
   (atur `playOnGiftOpen: false` jika ingin hanya lewat tombol ♪), dan bisa di-pause kapan saja
   lewat tombol ♪ di pojok kanan atas.
3. Selama file belum ada, website memainkan melodi *music box* "Happy Birthday"
   yang dibuat langsung oleh browser (Web Audio). Matikan dengan `fallbackMelody: false`.

### Warna & font
Token desain ada di bagian atas `css/style.css` (`--primary`, `--secondary`, `--soft`, …).
Ubah satu variabel dan seluruh website ikut berubah.

---

## Birthday Quest, Cake & Gifts

Semua konten diatur di `js/config.js`, bagian `quest`, `cake`, dan `gifts`.
Progres disimpan di browser penerima memakai penyimpanan yang sama dengan fitur lain
(`localStorage`, aman jika diblokir).

### Misi Ulang Tahun (`quest`)

| Tahap | Cara main | Pengaturan |
|---|---|---|
| 1 · Benda Tersembunyi | Ikon kecil yang berkelip di salah satu halaman. Ketuk untuk mendapat token 1. Tombol **Tunjukkan tempatnya** membuka halamannya dan menyorot ikonnya. | `hiddenObject.page` (`home`, `memories`, `moments`, `reasons`, `letter`, `surprise`), `icon`, `hint`, `foundMessage` |
| 2 · Kuis Ulang Tahun | Beberapa pertanyaan pilihan ganda. Jawaban salah hanya dinonaktifkan ("Hampir! Coba yang lain"), tanpa skor atau hukuman. | `trivia.questions` |
| 3 · Puzzle Mini | Foto dipotong 3×3. Ketuk dua potongan untuk menukarnya sampai gambar utuh. | `puzzle.image`, `puzzle.grid` (2–4), `puzzle.intro` |

- **Trivia otomatis:** jika `trivia.questions` dibiarkan `[]`, pertanyaan dibuat **hanya dari isi
  config yang sudah ada**: tanggal `firstMet`, `location` di `memories`, dan judul `reasons`.
  Jawaban salahnya berupa tanggal lain, lokasi kenangan lain, atau pilihan yang jelas bercanda.
  Tidak ada kenangan yang dikarang.
- **Pertanyaan sendiri:**
  ```js
  questions: [
    { question: "Apa minuman favoritku?", options: ["Teh", "Kopi susu", "Jus"], answer: 1 }
  ]
  ```
  `answer` adalah nomor urut jawaban benar, mulai dari 0. Urutan pilihan diacak saat tampil.
- Tahap terbuka berurutan (1 → 2 → 3). Setiap token hanya bisa didapat **satu kali**.
- Setelah 3 token terkumpul, muncul kartu **Buka hadiah terakhirmu** dan Hadiah 04 terbuka.
- Tombol kecil **Atur ulang progres misi** di bawah halaman Misi menghapus token (berguna untuk
  mencoba ulang sebelum dikirim). Kado yang sudah dibuka tetap tercatat.

### Kue Ulang Tahun (`cake`)

`candles` (1–9), `wishMessage`, `wishHint`, `celebrationTitle`, dan `celebrationMessage`
(nama di ucapan diambil dari `partner.nickname`). Alurnya: **Buat Permohonan** → momen permohonan
(±2,5 detik) → **Tiup Lilinnya** → lilin padam satu per satu → confetti + ucapan →
**Nyalakan lagi**. Tidak ada izin mikrofon; semuanya lewat tombol.

### Hadiah Ulang Tahun (`gifts.items`)

| Gift | `type` | Isi yang bisa diatur |
|---|---|---|
| 01 | `message` | `title`, `label`, `message`, `insideJoke` (kosong = tidak tampil), `note` |
| 02 | `photos` | `message`, `photos: [{ src, caption }]` (foto atau screenshot chat di `assets/images/`) |
| 03 | `audio` | `message`, `audio` (file di `assets/audio/`), `missingMessage` (tampil selama file belum ada) |
| 04 | `letter` | `message`, `signature` (kosong = `sender.name`), `requiresQuest`, `lockedMessage` |

- Hadiah 01–03 selalu bisa dibuka. Hadiah dengan `requiresQuest: true` terkunci sampai Misi selesai;
  ubah ke `false` jika ingin semua kado bebas dibuka.
- Kado yang sudah dibuka ditandai **Sudah dibuka** dan bisa dibuka ulang kapan saja.
- Saat voice note diputar, musik latar otomatis di-pause.
- **Konten Gift 01, 02, dan 04 saat ini adalah contoh.** Gift 02 memakai ilustrasi placeholder
  yang sudah ada. Ganti dengan lelucon pribadi, foto/screenshot, dan surat kalian sendiri.

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
