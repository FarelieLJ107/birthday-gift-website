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
  showAge: true,                // tampilkan "turning 27" di dashboard
  firstMet: "2023-02-14",       // tanggal pertama bertemu / jadian

  /* ---------- Halaman pembuka ---------- */
  intro: {
    title: "A Little Surprise For You",
    subtitle: "Someone made something special just for you.",
    button: "Open Your Gift"
  },

  /* ---------- Dashboard ---------- */
  home: {
    greeting: "Hello, birthday girl",     // sapaan kecil di header
    headline: "Happy Birthday, My Favorite Person",
    heroPhoto: "assets/images/hero.svg",
    heroCaption: "the best thing that ever happened to me",
    note: "I made this little book so you can carry a piece of us wherever you go. Take your time, open every page, and remember — every page is about you."
  },

  /* ---------- Musik latar ----------
     Musik TIDAK diputar otomatis — penerima menekan tombol musik dulu. */
  music: {
    src: "assets/music/our-song.mp3",
    title: "Our Song",
    artist: "for you, always",
    fallbackMelody: true,        // true = mainkan melodi music box jika file tidak ada
    playOnGiftOpen: true         // true = musik mulai saat tombol "Open Your Gift" ditekan
  },

  /* ---------- Our Memories (galeri + halaman detail) ----------
     size  : "normal" | "tall" | "wide"  (mengatur bentuk kartu di grid)
     tag   : kategori untuk filter chip di atas galeri
     extraPhotos : foto tambahan di halaman detail (boleh kosong [])          */
  memories: [
    {
      id: "first-photo",
      title: "Our First Photo",
      date: "2023-02-18",
      tag: "Dates",
      size: "tall",
      photo: "assets/images/memory-01.svg",
      caption: "Blurry, awkward, and my favorite picture ever.",
      story: "We didn't even know how to stand next to each other yet. You laughed right when the shutter clicked, and I've been chasing that laugh ever since.",
      note: "you said delete it. I never did.",
      location: "Little café on 5th street",
      extraPhotos: ["assets/images/memory-02.svg", "assets/images/memory-03.svg"]
    },
    {
      id: "coffee-dates",
      title: "Endless Coffee Dates",
      date: "2023-04-02",
      tag: "Dates",
      size: "normal",
      photo: "assets/images/memory-02.svg",
      caption: "Two cups, a hundred stories.",
      story: "Every Sunday became our Sunday. Your order never changes, and somehow that's one of my favorite things about you.",
      note: "oat latte, less sugar. I remember.",
      location: "Our usual corner",
      extraPhotos: ["assets/images/memory-01.svg"]
    },
    {
      id: "sunset-walk",
      title: "The Golden Hour Walk",
      date: "2023-07-21",
      tag: "Trips",
      size: "wide",
      photo: "assets/images/memory-03.svg",
      caption: "The sky was pink, and so were your cheeks.",
      story: "We walked until the sun gave up. You stopped to take a picture of the sky, and I took a picture of you instead.",
      note: "best view: you.",
      location: "Hill behind the city",
      extraPhotos: ["assets/images/memory-05.svg", "assets/images/memory-04.svg"]
    },
    {
      id: "flower-market",
      title: "Flower Market Morning",
      date: "2023-09-09",
      tag: "Trips",
      size: "normal",
      photo: "assets/images/memory-04.svg",
      caption: "You picked the tiniest bouquet.",
      story: "You spent twenty minutes choosing between two almost identical bouquets. I bought both when you weren't looking.",
      note: "they lasted 9 days. I counted.",
      location: "Saturday flower market",
      extraPhotos: []
    },
    {
      id: "birthday-balloons",
      title: "Your Last Birthday",
      date: "2023-11-12",
      tag: "Celebrations",
      size: "tall",
      photo: "assets/images/memory-05.svg",
      caption: "Balloons everywhere, smile even bigger.",
      story: "I tried so hard to keep it a secret and failed by noon. You pretended to be surprised anyway, which is exactly why I love you.",
      note: "this year I kept the secret. 🤍",
      location: "Your living room",
      extraPhotos: ["assets/images/memory-07.svg"]
    },
    {
      id: "late-night-talks",
      title: "Late Night Talks",
      date: "2024-01-30",
      tag: "Silly",
      size: "normal",
      photo: "assets/images/memory-06.svg",
      caption: "3 a.m. and still not sleepy.",
      story: "We talked about everything and nothing — aliens, our future dog, the perfect fried rice. I didn't want the night to end.",
      note: "our future dog is named Mochi.",
      location: "On the phone, as always",
      extraPhotos: []
    },
    {
      id: "anniversary",
      title: "One Year of Us",
      date: "2024-02-14",
      tag: "Celebrations",
      size: "wide",
      photo: "assets/images/memory-07.svg",
      caption: "365 days, and I'd choose you every single one.",
      story: "A whole year of you. We went back to the café where it all started and ordered the exact same things.",
      note: "here's to forever, okay?",
      location: "Where it all began",
      extraPhotos: ["assets/images/memory-01.svg", "assets/images/memory-02.svg"]
    },
    {
      id: "little-notes",
      title: "Your Little Notes",
      date: "2024-06-05",
      tag: "Silly",
      size: "normal",
      photo: "assets/images/memory-08.svg",
      caption: "I keep every one of them.",
      story: "Sticky notes in my bag, on my mirror, inside my books. Tiny reminders that someone out there is thinking about me.",
      note: "the 'drink water!!' one is my favorite.",
      location: "Everywhere",
      extraPhotos: []
    }
  ],

  /* ---------- Little Moments (timeline) ---------- */
  moments: [
    {
      date: "2023-02-14",
      title: "The Day We Met",
      photo: "assets/images/moment-01.svg",
      story: "A random Tuesday that turned into the most important day of my year. I still remember what you were wearing.",
      sticker: "heart"
    },
    {
      date: "2023-02-18",
      title: "Our First Picture",
      photo: "assets/images/moment-02.svg",
      story: "Four days later — one photo, slightly out of focus, completely perfect.",
      sticker: "star"
    },
    {
      date: "2023-07-21",
      title: "Our Favorite Moment",
      photo: "assets/images/moment-03.svg",
      story: "Golden hour, sore feet, and the first time you held my hand without me asking.",
      sticker: "flower"
    },
    {
      date: "2024-01-30",
      title: "Little Things I Remember",
      photo: "assets/images/moment-04.svg",
      story: "How you hum when you cook. How you say 'wait wait wait' before every punchline. I remember all of it.",
      sticker: "sparkles"
    },
    {
      date: "today",                 // "today" = otomatis tanggal hari ini
      title: "Today, Your Special Day",
      photo: "assets/images/moment-05.svg",
      story: "And now here we are. Another year of you in this world — the luckiest thing for all of us, especially me.",
      sticker: "gift"
    }
  ],

  /* ---------- Reasons Why I Love You ----------
     icon: heart | smile | sun | coffee | moon | flower | star | sparkles |
           book | music | shield | feather | camera | gift                     */
  reasons: [
    { icon: "smile",    title: "Your laugh",            description: "It's loud, it's contagious, and it fixes my worst days in about three seconds." },
    { icon: "sun",      title: "You're my morning",     description: "Your 'good morning' text is the first thing I look for every single day." },
    { icon: "shield",   title: "You make me feel safe", description: "With you I never have to pretend. I can just be me, and that's enough." },
    { icon: "coffee",   title: "Our little rituals",    description: "Sunday coffee, Friday movies, the way we always share dessert." },
    { icon: "heart",    title: "Your kind heart",       description: "You're gentle with everyone — strangers, animals, even me when I'm grumpy." },
    { icon: "star",     title: "You dream big",         description: "Watching you chase your goals makes me want to be better too." },
    { icon: "moon",     title: "Late night you",        description: "Sleepy, silly, honest you at 2 a.m. is one of my favorite people." },
    { icon: "book",     title: "You remember things",   description: "The small details I mention once — you keep them like treasures." },
    { icon: "music",    title: "Your terrible singing", description: "Off-key in the car, full volume, zero shame. Never stop." },
    { icon: "flower",   title: "You make things pretty",description: "Flowers on the table, doodles on receipts — you make ordinary days lovely." },
    { icon: "feather",  title: "Your patience",         description: "You wait for me, explain things twice, and never make me feel small." },
    { icon: "sparkles", title: "Simply, you're you",    description: "There isn't a reason big enough. It's just you — all of you — always." }
  ],

  /* ---------- My Letter ---------- */
  letter: {
    title: "A Letter Just For You",
    subtitle: "Sealed with love, opened only by you.",
    button: "Open My Letter",
    greeting: "Dear Lia,",
    paragraphs: [
      "Happy birthday, my love. I've rewritten this letter more times than I want to admit, because no words ever feel big enough for you.",
      "Thank you for every ordinary day you turned into something I want to remember. For the patience, the laughter, the late-night talks and the quiet mornings.",
      "I hope this year is soft to you. I hope it gives you everything you've been brave enough to wish for — and I hope I get to be right there next to you for all of it.",
      "No matter where we are or how busy life gets, please remember this: you are so, so loved."
    ],
    closing: "Forever yours,",
    signature: "Rafi"
  },

  /* ---------- Birthday Surprise ---------- */
  surprise: {
    title: "One Last Surprise",
    subtitle: "You made it to the very last page.",
    button: "Open Your Present",
    message: "Happy Birthday, Lia! Thank you for being the most beautiful part of my life. This is only the beginning of another year full of us.",
    photo: "assets/images/surprise-photo.svg",
    giftTitle: "Your Present",
    giftDescription: "A weekend getaway — just the two of us. Pack a small bag, I'll handle the rest.",
    giftNote: "valid forever, redeemable with one hug"
  },

  /* ---------- QR Gift: "A Secret Message Just For You" ----------
     QR berbentuk hati yang membuka website ini saat dipindai dengan
     Google Lens, kamera HP, WhatsApp, atau aplikasi scanner lain.

     destinationUrl : alamat PUBLIK website (GitHub Pages / Netlify).
                      Jangan pakai localhost, alamat IP, atau link preview.
     redirectPage   : file tujuan, boleh dikosongkan ("") atau "index.html".
     redirectHash   : halaman yang dibuka: "" atau "#intro" (pembuka),
                      "#surprise", "#letter", dst.
     autoRedirect   : true = scanner internal langsung membuka link, TAPI
                      hanya untuk link milik website ini sendiri (https).
                      Link lain selalu menunggu tombol "Open Link".        */
  qrSettings: {
    enabled: true,

    destinationUrl: "https://farelielj107.github.io/birthday-gift-website/",
    redirectPage: "",
    redirectHash: "",

    autoRedirect: false,

    scannerEnabled: true,
    allowCameraScanning: true,
    allowImageUpload: true,
    allowExternalScanner: true,   // tampilkan panduan scan via Google Lens / kamera

    design: {
      theme: "romantic-pink",
      style: "heart",             // tampilan awal: "heart" atau "standard"
      foreground: "#D83F72",      // warna modul QR (pakai warna yang cukup gelap)
      background: "#FFFFFF",      // background QR (harus terang)
      errorCorrection: "H",       // H = paling tahan rusak (30%), wajib untuk QR hati
      size: 1000,                 // ukuran PNG default (px); ada pilihan 2000 px
      margin: 4,                  // quiet zone, minimal 4 modul
      centerHeart: true           // hati kecil di tengah QR (aman berkat level H)
    }
  }
};
