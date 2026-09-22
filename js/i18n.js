/* ============================================================
   ТЕКСТЫ САЙТА НА ДВУХ ЯЗЫКАХ — русский (ru) и азербайджанский (az).
   Ключи совпадают с атрибутами data-i18n в index.html.
   Меняете текст — меняйте его в обоих языках.
   ============================================================ */

const I18N = {

  ru: {
    pageTitle: "Приглашение на свадьбу",

    gateText1: "Эта страница отображается только на смартфонах<br>в вертикальной ориентации.",
    gateText2: "Наведите камеру телефона на QR-код:",

    lockTitle: "ПРИГЛАШЕНИЕ",
    lockSub: "на свадьбу",
    lockHint: "Разблокируйте<br>приглашение",

    filmHint: "нажмите, чтобы перелистнуть",

    greetTitle: "ДОРОГИЕ РОДНЫЕ<br>И БЛИЗКИЕ!",
    greetP1: "Приглашаем Вас разделить с нами радость особенного для нас события и стать частью нашей семейной истории!",
    greetP2: "Совсем скоро состоится наша СВАДЬБА!<br>И мы не представляем этот праздник без Вас, близких и дорогих нам людей.",

    dateTitle: "Дата",
    // Дата текстом — прописана вручную, а не берётся из браузера: многие
    // телефоны не знают азербайджанских названий месяцев/дней недели и
    // вместо "3 oktyabr" пишут "M10 3". При смене даты в config.js —
    // поменяйте и эти три строки в обоих языках.
    dateText: "3 ОКТЯБРЯ 2026",
    dayMonth: "3 октября",
    weekday: "СУББОТА",
    weekdaysShort: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
    startsAt: "НАЧАЛО В",          // "СУББОТА · НАЧАЛО В 18:00"
    startsAtLower: "начало в",     // "3 октября · начало в 18:00"

    locTitle: "Локация",
    venueTitle: 'В РЕСТОРАНЕ "ЗАМОК ДРУЖБЫ"', //   — неразрывный пробел, название не рвётся
    venueAddress: "г. Тюмень, ул. Дружбы, 183",
    mapLink: "Открыть в Яндекс Картах ↗",
    toRsvp: "ПОДТВЕРДИТЬ ПРИСУТСТВИЕ",

    replay: "↻ Посмотреть приглашение ещё раз",
    rsvpTitle: "ПОДТВЕРДИТЕ, ПОЖАЛУЙСТА,<br>СВОЁ ПРИСУТСТВИЕ",
    surnameLabel: "Ваша фамилия:",
    surnamePh: "Ивановы",
    nameLabel: "Ваше имя (если Вы придете со своей парой, то укажите оба имени):",
    namePh: "Иван и Анна",
    presenceLegend: "Присутствие:",
    presenceYes: "Я (мы) с удовольствием приду (придем)",
    presenceNo: "К сожалению, не смогу (не сможем) присутствовать",
    submit: "ПОДТВЕРДИТЬ",
    sending: "ОТПРАВКА…",
    success: "Спасибо! Ваш ответ записан.",
    sendError: "Не удалось отправить ответ. Проверьте интернет-соединение и попробуйте ещё раз.",
    finalTitle: "Ждём Вас!"
  },

  az: {
    pageTitle: "Toy dəvətnaməsi",

    gateText1: "Bu səhifə yalnız smartfonlarda<br>şaquli rejimdə göstərilir.",
    gateText2: "Telefonunuzun kamerasını QR-koda yönəldin:",

    lockTitle: "DƏVƏTNAMƏ",
    lockSub: "Toy mərasiminə",
    lockHint: "Dəvətnaməni<br>açın",

    filmHint: "vərəqləmək üçün toxunun",

    greetTitle: "ƏZİZ QOHUMLARIMIZ<br>VƏ YAXINLARIMIZ!",
    greetP1: "Sizi bizim üçün xüsusi olan bu günün sevincini bizimlə bölüşməyə və ailə tariximizin bir parçası olmağa dəvət edirik!",
    greetP2: "Çox yaxında bizim TOYUMUZ olacaq!<br>Və biz bu bayramı Sizsiz — bizə yaxın və əziz insanlarsız təsəvvür edə bilmirik.",

    dateTitle: "Tarix",
    dateText: "3 OKTYABR 2026",
    dayMonth: "3 oktyabr",
    weekday: "ŞƏNBƏ",
    weekdaysShort: ["B.e","Ç.a","Ç","C.a","C","Ş","B"],
    startsAt: "BAŞLANĞIC SAAT",
    startsAtLower: "başlanğıc saat",

    locTitle: "Məkan",
    venueTitle: '"ЗАМОК ДРУЖБЫ"<br>RESTORANINDA',
    venueAddress: "Tümen şəhəri, Drujbı küçəsi, 183",
    mapLink: "Yandex Xəritədə açın ↗",
    toRsvp: "İŞTİRAKI TƏSDİQLƏYİN",

    replay: "↻ Dəvətnaməyə yenidən baxın",
    rsvpTitle: "ZƏHMƏT OLMASA,<br>İŞTİRAKINIZI TƏSDİQLƏYİN",
    surnameLabel: "Soyadınız:",
    surnamePh: "Məmmədovlar",
    nameLabel: "Adınız (əgər cütünüzlə gələcəksinizsə, hər iki adı yazın):",
    namePh: "Elvin və Aysel",
    presenceLegend: "İştirak:",
    presenceYes: "Məmnuniyyətlə gələcəyəm (gələcəyik)",
    presenceNo: "Təəssüf ki, iştirak edə bilməyəcəyəm (bilməyəcəyik)",
    submit: "TƏSDİQLƏ",
    sending: "GÖNDƏRİLİR…",
    success: "Təşəkkür edirik! Cavabınız qeydə alındı.",
    sendError: "Cavabı göndərmək mümkün olmadı. İnternet bağlantısını yoxlayın və yenidən cəhd edin.",
    finalTitle: "Sizi gözləyirik!"
  }
};
