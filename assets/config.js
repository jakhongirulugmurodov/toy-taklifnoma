/* ══════════════════════════════════════════════════
   Sozlamalar — sana va tadbir ma'lumotlari shu yerda
   ══════════════════════════════════════════════════ */
window.TOY = {

  /* Backend yo'q — tilaklar bo'limi mijoz talabi bilan olib tashlangan */
  api: '',

  /* Tadbir boshlanishi — ISO, O'zbekiston vaqti (+05:00).
     Sanoq shu vaqtga sanaydi; sahifadagi barcha sana matnlari
     (muhr, hero, kalendar, footer) ham shundan avtomatik yoziladi.
     Nahorgi osh bomdoddan keyin, aniq vaqt yo'q — saytda vaqt yozilmaydi
     (mijoz talabi). 06:00 faqat sanoq uchun; kalendar fayli butun kunlik. */
  date: '2026-10-31T06:00:00+05:00',
  endDate: '2026-10-31T13:00:00+05:00',

  /* Tadbir ma'lumotlari (kalendar fayli uchun) */
  title: "Islombekning nikoh to'yi — nahorgi osh",
  note: "Erkaklar uchun — nahorgi oshga · Ayollar uchun — soat 11:00",
  place: "«E'zoza» tantanalar saroyi, Andijon",

  /* Xaritada ko'rsatiladigan nuqta (Plus code PCW4+423, Andijon) */
  mapQuery: "40.745263,72.405047"
};
