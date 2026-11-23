/* ==========================================================================
   config.js — SATU-SATUNYA FILE YANG PERLU KAMU EDIT
   --------------------------------------------------------------------------
   Semua nama, tanggal, foto, cerita, alasan, surat, kejutan, dan musik
   diatur di sini. Ganti teks di dalam tanda kutip, simpan, lalu refresh.

   Foto  : taruh file di  assets/images/  lalu tulis path-nya, misal
           "assets/images/kita-di-pantai.jpg"  (jpg / png / webp / svg).
   Musik : taruh file di  assets/music/   lalu tulis path-nya di `music.src`.
   Tanggal: format "YYYY-MM-DD", misal "2026-11-12".

   Jika foto tidak ditemukan, website otomatis menampilkan placeholder.
   Jika musik tidak ditemukan, website memainkan melodi "music box" lembut.
   ========================================================================== */

window.BIRTHDAY_CONFIG = {
  /* ---------- Orang-orang ---------- */
  partner: {
    name: "Aurelia",            // nama lengkap / panggilan utama
    nickname: "Lia",            // panggilan sayang (dipakai di beberapa tempat)
    photo: "assets/images/profile.svg"
  },
  sender: {
    name: "Rafi"                // nama kamu (pengirim)
  },

  /* ---------- Tanggal penting ---------- */
  birthday: "1999-11-12",       // tanggal lahir — tahun dipakai untuk menghitung umur
  showAge: true,                // tampilkan "menuju 27" di dashboard
  firstMet: "2023-02-14",       // tanggal pertama bertemu / jadian

  /* ---------- Halaman pembuka ---------- */
  intro: {
    title: "Sebuah Kejutan Kecil Untukmu",
    subtitle: "Seseorang membuat sesuatu yang istimewa khusus untukmu.",
    button: "Buka Hadiahmu"
  },

  /* ---------- Dashboard ---------- */
  home: {
    greeting: "Halo, yang lagi ulang tahun",     // sapaan kecil di header
    headline: "Selamat Ulang Tahun, Orang Favoritku",
    heroPhoto: "assets/images/hero.svg",
    heroCaption: "hal terbaik yang pernah terjadi dalam hidupku",
    note: "Aku membuat buku kecil ini supaya kamu bisa membawa sepotong cerita kita ke mana pun kamu pergi. Pelan-pelan saja, buka setiap halamannya, dan ingat — setiap halaman ini tentang kamu."
  },

  /* ---------- Musik latar ----------
     Musik TIDAK diputar otomatis — penerima menekan tombol musik dulu. */
  music: {
    src: "assets/music/our-song.mp3",
    title: "Lagu Kita",
    artist: "untukmu, selalu",
    fallbackMelody: true,        // true = mainkan melodi music box jika file tidak ada
    playOnGiftOpen: true         // true = musik mulai saat tombol "Buka Hadiahmu" ditekan
  },

  /* ---------- Galeri Kamu: "Potret Kesayanganku" (galeri + halaman detail) ----------
     Isi dengan FOTO PASANGANMU (selfie, foto yang dia kirim, screenshot video call, dst).
     Semua teks di bawah adalah CONTOH — ganti dengan kata-katamu sendiri.

     title       : judul foto
     date        : tanggal foto (YYYY-MM-DD)
     tag         : album / kategori untuk filter di atas galeri
     size        : "normal" | "tall" | "wide"  (bentuk kartu di grid)
     photo       : path foto di assets/images/
     caption     : kalimat singkat — kenapa kamu suka foto ini
     story       : cerita lebih panjang di halaman detail
     note        : catatan tulisan tangan (kosong = tidak ditampilkan)
     location    : asal foto, misal "Dikirim lewat WhatsApp" (kosong = tidak ditampilkan)
     extraPhotos : foto tambahan di halaman detail (boleh kosong [])                    */
  memories: [
    {
      id: "senyum-favorit",
      title: "Senyum Favoritku",
      date: "2023-02-18",
      tag: "Senyummu",
      size: "tall",
      photo: "assets/images/memory-01.svg",
      caption: "Senyum yang selalu berhasil bikin hariku lebih ringan.",
      story: "Kalau hariku lagi berat, aku buka lagi foto ini. Entah kenapa, semuanya langsung terasa baik-baik saja.",
      note: "simpan senyum ini buat aku, ya.",
      location: "Dikirim lewat WhatsApp",
      extraPhotos: ["assets/images/memory-07.svg"]
    },
    {
      id: "selfie-pagi",
      title: "Selfie Pagi Hari",
      date: "2023-04-02",
      tag: "Selfie",
      size: "normal",
      photo: "assets/images/memory-02.svg",
      caption: "Masih ngantuk, rambut berantakan — tetap cantik.",
      story: "Foto sederhana, tanpa filter, tanpa pose. Justru karena itu aku suka: ini kamu yang paling apa adanya.",
      note: "cantik tanpa usaha itu curang, tahu.",
      location: "Dikirim lewat WhatsApp",
      extraPhotos: []
    },
    {
      id: "tawa-lepas",
      title: "Tawa yang Tertangkap Kamera",
      date: "2023-07-21",
      tag: "Lucu",
      size: "wide",
      photo: "assets/images/memory-03.svg",
      caption: "Tawamu yang ini bisa kudengar walau cuma lewat foto.",
      story: "Ada foto yang bagus karena posenya, dan ada foto yang bagus karena orangnya bahagia. Yang ini jenis kedua.",
      note: "tawa favoritku sedunia.",
      location: "Dari story-mu",
      extraPhotos: ["assets/images/memory-05.svg"]
    },
    {
      id: "video-call",
      title: "Dari Layar Video Call",
      date: "2023-09-09",
      tag: "Video Call",
      size: "normal",
      photo: "assets/images/memory-04.svg",
      caption: "Jarak boleh jauh, tapi kamu selalu terasa dekat.",
      story: "Tangkapan layar dari salah satu video call kita. Kualitasnya pecah-pecah, tapi tetap jadi salah satu foto paling berharga buatku.",
      note: "screenshot diam-diam, maaf ya.",
      location: "Tangkapan layar video call",
      extraPhotos: []
    },
    {
      id: "gaya-andalan",
      title: "Gaya Andalanmu",
      date: "2023-11-12",
      tag: "Selfie",
      size: "tall",
      photo: "assets/images/memory-05.svg",
      caption: "Pose yang selalu kamu pakai, dan selalu berhasil.",
      story: "Kamu punya satu gaya foto yang selalu kamu ulang. Aku nggak pernah bosan melihatnya.",
      note: "jangan pernah ganti pose ini.",
      location: "Dikirim lewat WhatsApp",
      extraPhotos: []
    },
    {
      id: "ekspresi-lucu",
      title: "Ekspresi Paling Lucu",
      date: "2024-01-30",
      tag: "Lucu",
      size: "normal",
      photo: "assets/images/memory-06.svg",
      caption: "Foto yang mungkin ingin kamu hapus. Maaf, sudah kusimpan.",
      story: "Bukan foto paling rapi, tapi foto paling jujur. Setiap kali melihatnya aku pasti ikut tertawa.",
      note: "aman di galeriku, selamanya.",
      location: "Tangkapan layar video call",
      extraPhotos: []
    },
    {
      id: "senyum-malu",
      title: "Senyum Malu-Malu",
      date: "2024-02-14",
      tag: "Senyummu",
      size: "wide",
      photo: "assets/images/memory-07.svg",
      caption: "Senyum yang muncul waktu kamu berusaha menahannya.",
      story: "Kamu bilang fotonya jelek. Aku bilang ini salah satu foto terbaikmu. Aku masih yakin aku yang benar.",
      note: "terbukti: aku benar.",
      location: "Dikirim lewat WhatsApp",
      extraPhotos: ["assets/images/memory-01.svg"]
    },
    {
      id: "selamat-malam",
      title: "Selamat Malam Versi Kamu",
      date: "2024-06-05",
      tag: "Video Call",
      size: "normal",
      photo: "assets/images/memory-08.svg",
      caption: "Wajah ngantuk yang selalu kutunggu sebelum tidur.",
      story: "Pemandangan terakhir sebelum layar mati di banyak malam kita. Cara paling manis untuk menutup hari.",
      note: "mimpi indah, sampai besok.",
      location: "Tangkapan layar video call",
      extraPhotos: []
    }
  ],

  /* ---------- Momen Kecil (lini masa) ---------- */
  moments: [
    {
      date: "2023-02-14",
      title: "Hari Kita Bertemu",
      photo: "assets/images/moment-01.svg",
      story: "Selasa biasa yang berubah jadi hari terpenting di tahun itu. Aku masih ingat baju yang kamu pakai.",
      sticker: "heart"
    },
    {
      date: "2023-02-18",
      title: "Foto Pertama Kita",
      photo: "assets/images/moment-02.svg",
      story: "Empat hari kemudian — satu foto, sedikit buram, tapi benar-benar sempurna.",
      sticker: "star"
    },
    {
      date: "2023-07-21",
      title: "Momen Favorit Kita",
      photo: "assets/images/moment-03.svg",
      story: "Golden hour, kaki pegal, dan pertama kalinya kamu menggenggam tanganku tanpa kuminta.",
      sticker: "flower"
    },
    {
      date: "2024-01-30",
      title: "Hal-Hal Kecil yang Kuingat",
      photo: "assets/images/moment-04.svg",
      story: "Caramu bersenandung saat memasak. Caramu bilang 'bentar bentar bentar' sebelum setiap lelucon. Aku ingat semuanya.",
      sticker: "sparkles"
    },
    {
      date: "today",                 // "today" = otomatis tanggal hari ini
      title: "Hari Ini, Hari Spesialmu",
      photo: "assets/images/moment-05.svg",
      story: "Dan sekarang, di sinilah kita. Satu tahun lagi kamu ada di dunia ini — keberuntungan terbesar bagi kami semua, terutama aku.",
      sticker: "gift"
    }
  ],

  /* ---------- Alasan Aku Sayang Kamu ----------
     icon: heart | smile | sun | coffee | moon | flower | star | sparkles |
           book | music | shield | feather | camera | gift                     */
  reasons: [
    { icon: "smile",    title: "Tawamu",                description: "Keras, menular, dan bisa memperbaiki hari terburukku dalam sekitar tiga detik." },
    { icon: "sun",      title: "Kamu pagiku",           description: "Pesan 'selamat pagi' darimu adalah hal pertama yang kucari setiap hari." },
    { icon: "shield",   title: "Kamu membuatku tenang", description: "Di dekatmu aku tidak perlu berpura-pura. Aku cukup jadi diriku sendiri, dan itu sudah cukup." },
    { icon: "coffee",   title: "Ritual kecil kita",     description: "Kopi hari Minggu, nonton film hari Jumat, dan cara kita selalu berbagi makanan penutup." },
    { icon: "heart",    title: "Hatimu yang baik",      description: "Kamu lembut pada semua orang — orang asing, hewan, bahkan aku saat sedang cemberut." },
    { icon: "star",     title: "Mimpimu besar",         description: "Melihatmu mengejar cita-cita membuatku ingin jadi lebih baik juga." },
    { icon: "moon",     title: "Kamu di tengah malam",  description: "Kamu yang mengantuk, konyol, dan jujur jam 2 pagi adalah salah satu orang favoritku." },
    { icon: "book",     title: "Kamu selalu ingat",     description: "Detail kecil yang hanya sekali kusebut — kamu simpan seperti harta karun." },
    { icon: "music",    title: "Suara nyanyianmu",      description: "Fals di mobil, volume penuh, tanpa malu sedikit pun. Jangan pernah berhenti." },
    { icon: "flower",   title: "Kamu membuat segalanya indah", description: "Bunga di meja, coretan di struk belanja — kamu membuat hari biasa jadi menyenangkan." },
    { icon: "feather",  title: "Kesabaranmu",           description: "Kamu menungguku, menjelaskan dua kali, dan tidak pernah membuatku merasa kecil." },
    { icon: "sparkles", title: "Karena kamu adalah kamu", description: "Tidak ada alasan yang cukup besar. Hanya kamu — seutuhnya — selalu." }
  ],

  /* ---------- Suratku ---------- */
  letter: {
    title: "Surat Khusus Untukmu",
    subtitle: "Disegel dengan cinta, hanya untuk dibuka olehmu.",
    button: "Buka Suratku",
    greeting: "Lia sayang,",
    paragraphs: [
      "Selamat ulang tahun, sayang. Aku sudah menulis ulang surat ini lebih sering dari yang ingin kuakui, karena tidak ada kata yang terasa cukup besar untukmu.",
      "Terima kasih untuk setiap hari biasa yang kamu ubah menjadi sesuatu yang ingin kuingat. Untuk kesabaranmu, tawamu, obrolan tengah malam, dan pagi-pagi yang tenang.",
      "Semoga tahun ini lembut padamu. Semoga tahun ini memberimu semua yang sudah berani kamu harapkan — dan semoga aku bisa ada tepat di sampingmu untuk semuanya.",
      "Di mana pun kita berada dan sesibuk apa pun hidup nanti, tolong ingat ini: kamu sangat, sangat dicintai."
    ],
    closing: "Selamanya milikmu,",
    signature: "Rafi"
  },

  /* ---------- Kejutan Ulang Tahun ---------- */
  surprise: {
    title: "Satu Kejutan Terakhir",
    subtitle: "Kamu sudah sampai di halaman paling akhir.",
    button: "Buka Kadomu",
    message: "Selamat ulang tahun, Lia! Terima kasih sudah menjadi bagian terindah dalam hidupku. Ini baru awal dari satu tahun lagi yang penuh dengan kita.",
    photo: "assets/images/surprise-photo.svg",
    giftTitle: "Kadomu",
    giftDescription: "Liburan akhir pekan — hanya kita berdua. Siapkan tas kecil, sisanya biar aku yang urus.",
    giftNote: "berlaku selamanya, bisa ditukar dengan satu pelukan"
  },

  /* ---------- Misi Ulang Tahun: perburuan harta karun mini (3 token) ----------
     Quest 1  hiddenObject : ikon kecil tersembunyi di salah satu halaman.
                             page: "home" | "memories" | "moments" | "reasons" | "letter"
                             icon: "star" | "heart" | "gift" | "sparkles" | "flower"
     Quest 2  trivia       : kuis ringan. Kosongkan `questions` ([]) agar pertanyaan
                             dibuat OTOMATIS dari isi config ini (tanggal pertama
                             bertemu, album/`tag` di `memories`, daftar `reasons`), jadi
                             tidak ada jawaban yang dikarang. Isi sendiri dengan format:
                             { question: "...", options: ["A","B","C"], answer: 0 }
                             (answer = nomor urut jawaban benar, mulai dari 0).
     Quest 3  puzzle       : susun ulang potongan foto (ketuk 2 kotak untuk menukar). */
  quest: {
    enabled: true,
    title: "Misi Ulang Tahun",
    subtitle: "Tiga tantangan kecil, tiga token, satu hadiah terakhir.",
    hiddenObject: {
      page: "moments",
      icon: "star",
      hint: "Ada bintang kecil yang bersembunyi di halaman Momen Kecil. Lihat baik-baik ✨",
      foundMessage: "Ketemu! Token 1 jadi milikmu."
    },
    trivia: {
      intro: "Cuma buat seru-seruan — tidak ada orang yang salah di sini, hanya jawaban yang salah.",
      questions: []
    },
    puzzle: {
      image: "assets/images/hero.svg",   // foto untuk puzzle (persegi lebih bagus)
      grid: 3,                           // 3 = 3×3 kotak (2–4)
      intro: "Ketuk dua potongan untuk menukarnya sampai gambarnya utuh lagi."
    },
    completeMessage: "Ketiga token sudah terkumpul. Hadiah terakhirmu sudah terbuka!"
  },

  /* ---------- Kue Ulang Tahun Interaktif ---------- */
  cake: {
    enabled: true,
    candles: 3,                          // jumlah lilin (1–9)
    wishMessage: "Pejamkan mata dan buat permohonan…",
    wishHint: "Pelan-pelan saja. Kalau sudah siap, tiup lilinnya.",
    celebrationTitle: "Selamat Ulang Tahun!",
    celebrationMessage: "Semoga setiap permohonan yang baru saja kamu buat menemukan jalannya padamu."
  },

  /* ---------- Koleksi Hadiah Ulang Tahun ----------
     type: "message" | "photos" | "audio" | "letter"
     Semua teks & file bisa diganti tanpa mengubah kode. Isi `insideJoke`
     dengan lelucon pribadi kalian (kosong = tidak ditampilkan).
     Audio: taruh file di assets/audio/ lalu tulis path-nya di `audio`.
     Gift dengan `requiresQuest: true` baru terbuka setelah Misi Ulang Tahun selesai. */
  gifts: {
    enabled: true,
    title: "Hadiah Ulang Tahunmu",
    subtitle: "Empat kotak kecil. Buka dengan urutan apa pun — kecuali yang terakhir.",
    items: [
      {
        id: "funny",
        type: "message",
        label: "Sesuatu yang konyol",
        title: "Hadiah Penuh Kekonyolan",
        message: "Peringatan: kotak ini berisi 100% kasih sayang, 0% kalori, dan tidak bisa dikembalikan.",
        insideJoke: "",
        note: "ketawa dulu, tanya belakangan"
      },
      {
        id: "memory",
        type: "photos",
        label: "Kenangan digital",
        title: "Kotak Kenangan Kecil",
        message: "Beberapa foto kamu yang selalu ingin kulihat lagi.",
        photos: [
          { src: "assets/images/memory-01.svg", caption: "Senyum Favoritku" },
          { src: "assets/images/memory-03.svg", caption: "Tawa yang Tertangkap Kamera" },
          { src: "assets/images/memory-07.svg", caption: "Senyum Malu-Malu" }
        ]
      },
      {
        id: "voice",
        type: "audio",
        label: "Tekan putar",
        title: "Pesan Suara Untukmu",
        message: "Cari tempat yang tenang dan besarkan volumenya.",
        audio: "assets/audio/birthday-message.mp3",
        missingMessage: "Pesan suaranya masih direkam — coba lagi nanti ya ♡"
      },
      {
        id: "final",
        type: "letter",
        label: "Hadiah terakhir",
        title: "Satu Hal Kecil Terakhir",
        message: "Kamu sudah menemukan setiap token, menyelesaikan setiap puzzle, dan membuka setiap kotak. Hadiah yang sebenarnya tidak pernah ada di dalam kotak — melainkan kesempatan untuk merayakanmu, hari ini dan setiap tahun setelahnya.",
        signature: "",                   // kosong = pakai sender.name
        requiresQuest: true,
        lockedMessage: "Hadiah ini terbuka setelah kamu menyelesaikan Misi Ulang Tahun."
      }
    ]
  }
};
