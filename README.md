# Sohibjon & Dilnozaxon — nikoh to'yi taklifnomasi

Mobil-birinchi onlayn taklifnoma + mehmonlar javoblarini ko'rish uchun admin panel.

**To'y:** 17-avgust 2026, soat 19:00 · «Grant Asia» restorani, Guliston ko'chasi 50A, Ishtixon.

---

## Fayllar

```
index.html            taklifnoma
admin.html            boshqaruv paneli (/admin.html)
assets/
  config.js           ⚙️  YAGONA sozlama fayli — sana, manzil, backend
  style.css           taklifnoma uslublari
  app.js              taklifnoma mantiqi
  admin.css           panel uslublari
  admin.js            panel mantiqi
  og.png              Telegram/WhatsApp uchun ulashish rasmi
  music.m4a           fon musiqasi (AAC 96k, 3.2 MB) — fayl yo'q bo'lsa tugma chiqmaydi
  couple-1.jpg        mehrob ramkasidagi rasm (portret)
  couple-2.jpg        keng lentadagi rasm
tools/make-og.py      ulashish rasmini qayta yasash
```

## Sozlash

Deyarli hamma narsa `assets/config.js` ichida:

| Qator | Nima |
|---|---|
| `api` | Backend manzili. `''` = backend yo'q · `'/'` = bir xil domen · `'https://…'` = alohida server |
| `date`, `endDate` | To'y vaqti (O'zbekiston vaqti, `+05:00`) |
| `title`, `place` | Kalendar fayli (.ics) uchun matn |
| `mapQuery` | Xaritada qidiriladigan nuqta |

Ismlarni, taklif matnini va kun tartibini `index.html` ichidan to'g'ridan-to'g'ri tahrirlash mumkin.

### Rasm va musiqa qo'shish

- Rasmlar → `assets/couple-1.jpg` (mehrob, portret) va `assets/couple-2.jpg` (keng lenta).
  Fayl bo'lmasa: mehrobda monogramma qoladi, lenta esa umuman ko'rinmaydi.
- Fon musiqasi → `assets/music.m4a`. Fayl bo'lmasa musiqa tugmasi ham, muhrdagi eslatma ham chiqmaydi.
  Yangi trekni siqish: `afconvert -f m4af -d aac -b 96000 -s 1 manba.mp3 assets/music.m4a`
- Ulashish rasmini yangilash → `python3 tools/make-og.py`

Musiqa: *Izzat Shukurov — Oshiqman*. Trek muallifiga tegishli; sayt shaxsiy taklifnoma sifatida ishlatilmoqda.

## Mehmonga havola

Oddiy havola hammaga bir xil:

```
https://<manzil>/
```

Xohlasangiz muhr ekranida mehmon ismi chiqadi:

```
https://<manzil>/?ism=Karimov%20oilasi
```

## Admin panel

`/admin.html` — parol so'raydi, so'ng:

- **Jami javob · Kelaman · Kelmayman · Oxirgi javob** raqamlari
- oxirgi 10 kunlik javoblar grafigi va taqsimot doirasi
- to'liq jadval: ism, javob, vaqt (qidiruv, filtr, saralash)
- **Excel'ga yuklash** (CSV, Excel to'g'ri ochadi)
- yozuvni o'chirish

Parol `ADMIN_KEY` maxfiy qiymatidan olinadi (pastga qarang).

> ⚠️ **Backend ulanmaguncha** panel faqat shu brauzerda berilgan javobni ko'rsatadi va parolni tekshirmaydi.
> Panelda shu haqda ogohlantirish chiqadi.

## Backend — Cloudflare Pages + D1

`functions/` papkasi Cloudflare Pages Functions. Uchta endpoint:

| Metod | Yo'l | Nima qiladi |
|---|---|---|
| `POST` | `/api/rsvp` | `{vid, name, answer:'yes'\|'no', at, website}` qabul qiladi. `website` bo'sh bo'lmasa — bot, jimgina tashlab yuboriladi. Bir xil `vid` qayta kelsa yangi qator qo'shilmay, eskisi yangilanadi. |
| `GET` | `/api/list` | `X-Admin-Key` sarlavhasini tekshiradi → `{items:[…]}` |
| `POST` | `/api/delete` | `X-Admin-Key` + `{id}` → yozuvni o'chiradi |

Himoya: asalarixona maydoni · IP bo'yicha soatiga 25 ta cheklov · admin kaliti vaqt-bo'yicha xavfsiz solishtiriladi.

### Birinchi marta o'rnatish

```bash
npx wrangler login
npx wrangler d1 create toy
```

Chiqqan `database_id` ni `wrangler.toml` ichiga yozing, so'ng:

```bash
npx wrangler d1 execute toy --remote --file=./schema.sql
npx wrangler pages project create toy-taklifnoma --production-branch=main
npx wrangler pages secret put ADMIN_KEY --project-name=toy-taklifnoma
npx wrangler pages secret put TG_TOKEN  --project-name=toy-taklifnoma
npx wrangler pages secret put TG_CHAT   --project-name=toy-taklifnoma
npx wrangler pages deploy . --project-name=toy-taklifnoma
```

Cloudflare panelida loyihani GitHub repo'ga ulasangiz — har `git push` avtomatik deploy bo'ladi.

> ⚠️ Cloudflare jonli bo'lgach **GitHub Pages'ni o'chiring**. Aks holda ikkita manzil bo'lib qoladi
> va eski manzilda javoblar saqlanmaydi.

### Telegram

1. [@BotFather](https://t.me/BotFather) → `/newbot` → token oling → `TG_TOKEN`.
2. Botni o'zingizga (yoki guruhga) yozdiring, so'ng
   `https://api.telegram.org/bot<TOKEN>/getUpdates` ochib `chat.id` ni oling → `TG_CHAT`.

Har yangi javobda shunday xabar tushadi:

```
✅ Aziz Karimov
Kelaman

Jami: 87 kelaman · 21 yo'q
```

## Mahalliy ishga tushirish

Faqat ko'rinishni tekshirish uchun:

```bash
python3 -m http.server 4321
```

Backend bilan birga (D1 ham ishlaydi):

```bash
npx wrangler pages dev .
```

---

Sayt [O'N agy.](https://onagy.app) tomonidan tayyorlandi.
