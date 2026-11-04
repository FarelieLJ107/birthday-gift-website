# Musik latar

Taruh file lagu kamu di folder ini, misalnya `our-song.mp3`, lalu pastikan
`music.src` di `js/config.js` menunjuk ke file itu:

```js
music: { src: "assets/music/our-song.mp3", title: "Our Song", ... }
```

Format yang aman untuk semua browser: **.mp3** (atau .m4a / .ogg).
Selama file belum ada, website memainkan melodi "music box" lembut sebagai pengganti.
