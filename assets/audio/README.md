# Audio gift

Taruh voice note / pesan suara ulang tahun di folder ini, misalnya `birthday-message.mp3`,
lalu pastikan `gifts.items[...].audio` di `js/config.js` menunjuk ke file itu.

Format yang aman untuk semua browser: **.mp3** atau **.m4a**.
Selama file belum ada, Gift 03 menampilkan pesan `missingMessage` (tidak ada error).
