# Islombek — nikoh to'yi taklifnomasi

Mobil-birinchi onlayn taklifnoma. Mijoz talabi bilan: faqat kuyov ismi, mehrobda rasm o'rniga
illyustratsiya, "Tadbir dasturi" va "Kelasizmi?" bo'limlari yo'q. Backend faqat **tilaklar** uchun
(Cloudflare Pages Functions + D1).

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

Rasmda sana bor, vaqt yo'q. Sana o'zgarsa qayta yasang.

```bash
OG_FONTS=/papka/shriftlar python3 tools/make-og.py   # Marcellus, Jost, Cormorant TTF bo'lgan papka
```

## Mehmonga havola

Hamma mehmonga bitta havola (mijoz talabi) — ikkala vaqt ham ko'rinadi:

```
https://islombek-taklifnoma.pages.dev/
https://islombek-taklifnoma.pages.dev/?ism=Karimov%20oilasi    ← muhrda mehmon ismi chiqadi
```

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

## Tilaklar — backend

| Metod | Yo'l | Nima qiladi |
|---|---|---|
| `POST` | `/api/wish` | `{vid, name, wish, website}` — bitta brauzerdan bitta tilak, qayta yuborsa yangilanadi |
| `GET` | `/api/wishes` | ochiq lenta: oxirgi 100 ta (ism + tilak) |
| `GET` | `/api/list` | admin, `X-Admin-Key` bilan |
| `POST` | `/api/delete` | admin, `{id}` — noo'rin tilakni o'chirish |

Himoya: asalarixona maydoni · IP bo'yicha soatiga 10 ta · admin kaliti vaqt-bo'yicha xavfsiz solishtiriladi.
Jadval birinchi so'rovda o'zi yaratiladi (`functions/_lib.js`).

**Baza ulanmagan bo'lsa** API `503` qaytaradi va saytda tilaklar bo'limi umuman ko'rinmaydi —
sayt buzilmaydi.

Ulash: D1 bazasini yarating (`islombek-tilaklar`), `database_id` ni `wrangler.toml` ga yozing.
Pages loyihasi sozlamalarida maxfiy qiymatlar:

- `ADMIN_KEY` — `/admin.html` paroli
- `TG_TOKEN`, `TG_CHAT` — ixtiyoriy: har yangi tilak Telegram'ga tushadi

## Mahalliy ishga tushirish

```bash
python3 -m http.server 4321                                   # faqat ko'rinish
npx wrangler pages dev . --d1 DB=local --binding ADMIN_KEY=test   # tilaklar bilan
```

---

Sayt [O'N agy.](https://onagy.app) tomonidan tayyorlandi.
