# Telegram uchun video taklifnoma

Ekranni real vaqtda yozib olish (Playwright recordVideo) yuklama bo'lsa tezligi
sakraydi, shuning uchun video **skrinshotlardan** yig'iladi — natija har safar bir xil.

1. Sayt lokal ishlab tursin: `python3 -m http.server 4321`
2. Skrinshotlar: `node tools/video-shots.js <papka>` → `seal.png`, `crack.png`,
   `full.png` (to'liq sahifa), `manzil.png` (xarita bilan), `marks.json` (bo'lim joylari)
3. `manzil.png` ni `full.png` dagi o'z joyiga qo'yish (fullPage skrinshotda iframe chizilmaydi).
4. ffmpeg: `full` rasm ustida `crop` bilan bir tekis surish (har bo'limda to'xtab),
   oldidan muhr (zoompan) va xfade, oxirida `assets/music.m4a` (fade in/out).

Natija: 1080×1920, ~40 s, H.264 + AAC, ~5 MB.
