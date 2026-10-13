/* ══════════════════════════════════════════════════
   Sozlamalar — sana va tadbir ma'lumotlari shu yerda
   ══════════════════════════════════════════════════ */
window.TOY = {

  /* Backend manzili (faqat tilaklar uchun — "Kelasizmi?" bo'limi yo'q).
       ''                          → backend yo'q, tilaklar bo'limi chiqmaydi
       '/'                         → sayt bilan bir xil domen (/api/…)
       'https://xxx.workers.dev'   → alohida server
     Baza (D1) ulanmagan bo'lsa ham sayt ishlaydi — bo'lim shunchaki yashirin. */
  api: '/',

  /* Tadbir boshlanishi — ISO, O'zbekiston vaqti (+05:00).
     Sanoq shu vaqtga sanaydi; sahifadagi barcha sana matnlari
     (muhr, hero, kalendar, footer) ham shundan avtomatik yoziladi.
     Nahorgi osh bomdoddan keyin — aniq vaqt belgilanmagan, mijoz
     06:00 ko'rinishini ma'qulladi. */
  date: '2026-10-31T06:00:00+05:00',
  endDate: '2026-10-31T13:00:00+05:00',

  /* Tadbir ma'lumotlari (kalendar fayli uchun) */
  title: "Islombekning nikoh to'yi — nahorgi osh",
  note: "Nahorgi osh — soat 06:00 · Ayollar uchun — soat 11:00",
  place: "«E'zoza» tantanalar saroyi, Andijon",

  /* Xaritada ko'rsatiladigan nuqta (Plus code PCW4+423, Andijon) */
  mapQuery: "40.745263,72.405047"
};
