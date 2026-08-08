# Sohibjon & Dilnozaxon — nikoh to'yi taklifnomasi

Mobil-birinchi onlayn taklifnoma + mehmonlar javoblarini ko'rish uchun admin panel.

**To'y:** 17-avgust 2026, soat 19:00 · «Grand Asia» to'yxonasi, Ishtixon.

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
  music.mp3           (ixtiyoriy) fon musiqasi — fayl yo'q bo'lsa tugma chiqmaydi
  couple.jpg          (ixtiyoriy) kelin-kuyov rasmi — yo'q bo'lsa monogramma qoladi
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

- Kelin-kuyov rasmi → `assets/couple.jpg` (kvadratga yaqin, ~800×1000 px). Fayl qo'yilsa mehrob ramkasida avtomatik chiqadi.
- Fon musiqasi → `assets/music.mp3`. Fayl bo'lmasa musiqa tugmasi ko'rinmaydi.
- Ulashish rasmini yangilash → `python3 tools/make-og.py`

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
- to'liq jadval: ism, javob, telefon, vaqt (qidiruv, filtr, saralash)
- **Excel'ga yuklash** (CSV, Excel to'g'ri ochadi)
- yozuvni o'chirish

> ⚠️ **Backend ulanmaguncha** panel faqat shu brauzerda berilgan javobni ko'rsatadi va parolni tekshirmaydi.
> Panelda shu haqda ogohlantirish chiqadi.

## Backend

Frontend backenddan mustaqil. Serverdan kutiladigan uchta endpoint:

| Metod | Yo'l | Nima qiladi |
|---|---|---|
| `POST` | `/api/rsvp` | `{name, phone, answer:'yes'\|'no', at, website}` qabul qiladi. `website` bo'sh bo'lmasa — bot, jimgina tashlab yuboriladi. |
| `GET` | `/api/list` | `X-Admin-Key` sarlavhasini tekshiradi → `{items:[…]}` qaytaradi |
| `POST` | `/api/delete` | `X-Admin-Key` + `{id}` → yozuvni o'chiradi |

Ulangach `assets/config.js` dagi `api` qatoriga manzil yoziladi — boshqa hech narsa o'zgarmaydi.

## Mahalliy ishga tushirish

```bash
python3 -m http.server 4321
```

Keyin `http://localhost:4321`.

---

Sayt [O'N agy.](https://onagy.app) tomonidan tayyorlandi.
