# Islombek — nikoh to'yi taklifnomasi

Mobil-birinchi onlayn taklifnoma. Mijoz talabi bilan: faqat kuyov ismi, mehrobda rasm o'rniga
illyustratsiya, "Tadbir dasturi" va "Kelasizmi?" bo'limlari yo'q — backend ham yo'q, sof statik sayt.

**Tadbir:** 31-oktabr 2026, shanba · nahorgi osh (06:00) · ayollar uchun (11:00) ·
«E'zoza» tantanalar saroyi, Andijon.

Nahorgi osh bomdoddan keyin bo'ladi, aniq vaqt belgilanmagan. Mijoz "bomdoddan keyin" deb
yozilmasin, 06:00 qolsin dedi.

---

## Fayllar

```
index.html            taklifnoma (mehrob illyustratsiyasi shu yerda, inline SVG)
assets/
  config.js           ⚙️  sana, tadbir, xarita nuqtasi
  style.css           uslublar
  app.js              mantiq
  og.png              Telegram/WhatsApp uchun ulashish rasmi
  music.m4a           fon musiqasi — fayl yo'q bo'lsa tugma chiqmaydi
tools/make-og.py      ulashish rasmini qayta yasash
```

## Sozlash

| Qayerda | Nima |
|---|---|
| `config.js` → `date`, `endDate` | Tadbir vaqti (`+05:00`). Muhr, hero, kalendar, footer dagi **barcha sana matnlari shundan avtomatik** yoziladi, sanoq ham shunga sanaydi |
| `config.js` → `title`, `note`, `place` | Kalendar fayli (.ics) uchun matn |
| `config.js` → `mapQuery` | Xaritadagi nuqta (koordinata) |
| `index.html` → `.hero__times` | Nahorgi osh va ayollar vaqti |
| `index.html` → `.card__body` | Taklif matni (mijoz bergan matn) |
| `index.html` → `.foot__family` | Imzo ("Kamoli ehtirom ila, …") |

### Musiqa

Mijoz *Izzat Shukurov — Oshiqman* qo'shig'ining **minus** variantini so'radi. Hozir faylda eski
(vokalli) variant turibdi. Minus faylini olib, siqib, almashtiring:

```bash
afconvert -f m4af -d aac -b 96000 -s 1 minus.mp3 assets/music.m4a      # macOS
ffmpeg -i minus.mp3 -c:a aac -b:a 96k -ac 1 assets/music.m4a            # boshqa
```

Trek muallifiga tegishli; sayt shaxsiy taklifnoma sifatida ishlatilmoqda.

### Ulashish rasmi

Rasmda sana bor, vaqt yo'q (bitta rasm ikkala havolada chiqadi). Sana o'zgarsa qayta yasang.

```bash
OG_FONTS=/papka/shriftlar python3 tools/make-og.py   # Marcellus, Jost, Cormorant TTF bo'lgan papka
```

## Mehmonga havola

Ikki xil havola — har mehmon faqat o'z vaqtini ko'radi:

```
https://islombek-taklifnoma.pages.dev/            ← nahorgi osh (06:00), ikkala vaqt ham ko'rinadi
https://islombek-taklifnoma.pages.dev/?ayollar    ← ayollar: faqat 11:00, sanoq va kalendar ham 11:00
```

Muhrda mehmon ismi chiqishi uchun `ism` qo'shiladi: `/?ism=Karimov%20oilasi`,
ayollarga: `/?ayollar&ism=Zulfiya%20opa`.

> ⚠️ Telegram ulashish rasmini birinchi marta ochilganda keshlab oladi. Havolani tarqatishdan
> **oldin** yakuniy versiyani deploy qiling, aks holda eski rasm/matn qolib ketadi.

## Joylash — Cloudflare Pages

**Sohibjon taklifnomasining `toy-taklifnoma` loyihasiga deploy qilmang** — u ustidan yoziladi.
Bu taklifnoma uchun alohida loyiha:

Kod `claude/charming-edison-lfv9y7` branch'ida. Wrangler login qilingan kompyuterda:

```bash
git fetch origin
git checkout claude/charming-edison-lfv9y7
npx wrangler pages project create islombek-taklifnoma --production-branch=claude/charming-edison-lfv9y7
npx wrangler pages deploy . --project-name=islombek-taklifnoma --branch=claude/charming-edison-lfv9y7
```

`project create` faqat birinchi marta. Keyingi o'zgarishlarda faqat `git pull` va `deploy`.

Loyiha nomi boshqacha bo'lsa, `index.html` dagi `og:url` va `og:image` manzillarini ham o'zgartiring.

## Mahalliy ishga tushirish

```bash
python3 -m http.server 4321
```

---

Sayt [O'N agy.](https://onagy.app) tomonidan tayyorlandi.
