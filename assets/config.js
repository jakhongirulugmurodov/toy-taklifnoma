/* ══════════════════════════════════════════════════
   Sozlamalar — sana va tadbir ma'lumotlari shu yerda
   ══════════════════════════════════════════════════ */
window.TOY = {

  /* Backend manzili.
       ''                          → backend yo'q (bu taklifnomada javob
                                     yig'ilmaydi — "Kelasizmi?" bo'limi yo'q)
       '/'                         → sayt bilan bir xil domen (/api/…)
       'https://xxx.workers.dev'   → alohida server                          */
  api: '',

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
