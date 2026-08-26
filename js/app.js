/* ============================================================
   Логика сайта-приглашения. Весь контент берётся из CONFIG (config.js).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Утилиты ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const pad2 = n => String(n).padStart(2, "0");

  const MONTHS_RU = ["ЯНВАРЯ","ФЕВРАЛЯ","МАРТА","АПРЕЛЯ","МАЯ","ИЮНЯ","ИЮЛЯ","АВГУСТА","СЕНТЯБРЯ","ОКТЯБРЯ","НОЯБРЯ","ДЕКАБРЯ"];
  const MONTH_NAMES_GEN = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
  const WEEKDAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

  const weddingDate = new Date(CONFIG.date);

  /* ============================================================
     0. ФОНОВОЕ ФОТО — один слой на весь сайт, вручную "приклеенный"
     к вьюпорту через JS (а не CSS position:fixed).
     Была попытка сделать свою картинку под каждым экраном (обходит
     баг iOS с "не перерисовывается без скролла"), но у секций разная
     высота — object-fit:cover обрезал фото по-разному в каждой, и на
     стыке экранов был виден шов. Правильное решение — один-единственный
     слой (без шва по определению), position:absolute (не fixed, чтобы
     не ловить баг с перерисовкой), а положение "как у fixed" эмулируется
     через transform: translateY(scrollY), который обновляется на каждом
     кадре через requestAnimationFrame.
     ============================================================ */
  const bgWrap = document.createElement("div");
  bgWrap.className = "site-bg";
  bgWrap.setAttribute("aria-hidden", "true");
  const bgImg = document.createElement("img");
  bgImg.className = "site-bg-img";
  bgImg.src = "assets/bg.jpg";
  bgImg.alt = "";
  bgWrap.appendChild(bgImg);
  document.body.insertBefore(bgWrap, document.body.firstChild);

  function syncBgPosition() {
    bgWrap.style.transform = `translateY(${window.scrollY}px)`;
    requestAnimationFrame(syncBgPosition);
  }
  requestAnimationFrame(syncBgPosition);

  /* ============================================================
     1. ЗАПОЛНЕНИЕ КОНТЕНТА ИЗ CONFIG
     ============================================================ */

  // Экран 1 — главный
  const dateShortEl = $(".date-short");
  if (dateShortEl) {
    dateShortEl.textContent = weddingDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  const monogramEl = $(".monogram");
  if (monogramEl) monogramEl.textContent = CONFIG.names.monogram;
  const namesEnEl = $(".names-en");
  if (namesEnEl) namesEnEl.textContent = CONFIG.names.en;

  // Экран 3 — дата текстом
  const dateCapsEl = $(".date-caps");
  if (dateCapsEl) dateCapsEl.textContent = CONFIG.dateText;

  // Экран 4 — локация
  const venueTitleEl = $(".venue-title");
  if (venueTitleEl) venueTitleEl.textContent = CONFIG.venue.title;
  const venueAddressEl = $(".venue-address");
  if (venueAddressEl) venueAddressEl.textContent = CONFIG.venue.address;
  const mapLink = $("#mapLink");
  if (mapLink) mapLink.href = CONFIG.venue.mapUrl;
  const venuePhoto = $("#venuePhoto");
  if (venuePhoto) {
    if (CONFIG.venue.photo) {
      venuePhoto.src = CONFIG.venue.photo;
      venuePhoto.onerror = () => { venuePhoto.style.display = "none"; };
    } else {
      venuePhoto.style.display = "none";
    }
  }

  // Экран 7 — дедлайн
  const rsvpDeadlineEl = $("#rsvpDeadline");
  if (rsvpDeadlineEl) rsvpDeadlineEl.textContent = "до " + CONFIG.rsvpDeadline;

  // Экран 8 — финал
  const finalNamesEl = $("#finalNames");
  if (finalNamesEl) finalNamesEl.textContent = CONFIG.names.ru;

  // Музыка
  const bgMusic = $("#bgMusic");
  const soundBtn = $("#soundToggle");
  if (CONFIG.musicSrc) {
    bgMusic.src = CONFIG.musicSrc;
  } else {
    soundBtn.style.display = "none";
  }

  /* ============================================================
     2. КАЛЕНДАРЬ
     ============================================================ */

  function buildCalendar() {
    const cal = $("#calendar");
    if (!cal) return;
    cal.innerHTML = "";

    const year = weddingDate.getFullYear();
    const month = weddingDate.getMonth();
    const targetDay = weddingDate.getDate();

    // Заголовок "ДЕКАБРЬ 2026" не дублируем — уже есть date-caps выше.
    const firstOfMonth = new Date(year, month, 1);
    let firstWeekday = firstOfMonth.getDay(); // 0=вс
    firstWeekday = firstWeekday === 0 ? 7 : firstWeekday; // 1=пн..7=вс
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    WEEKDAYS_RU.forEach(w => {
      const el = document.createElement("div");
      el.className = "cal-day cal-weekday";
      el.style.opacity = ".45";
      el.style.fontSize = "12px";
      el.textContent = w;
      cal.appendChild(el);
    });

    for (let i = 1; i < firstWeekday; i++) {
      cal.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement("div");
      el.className = "cal-day";
      el.textContent = d;
      if (d === targetDay) {
        el.classList.add("cal-target");
        const circle = document.createElement("span");
        circle.className = "circle";
        el.appendChild(circle);
      }
      cal.appendChild(el);
    }
  }
  buildCalendar();

  /* ============================================================
     3. ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
     ============================================================ */

  function updateTimer() {
    const now = new Date();
    let diff = weddingDate - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const tDays = $("#tDays"), tHours = $("#tHours"), tMinutes = $("#tMinutes"), tSeconds = $("#tSeconds");
    if (tDays) tDays.textContent = pad2(days);
    if (tHours) tHours.textContent = pad2(hours);
    if (tMinutes) tMinutes.textContent = pad2(minutes);
    if (tSeconds) tSeconds.textContent = pad2(seconds);
  }
  updateTimer();
  setInterval(updateTimer, 1000);

  /* ============================================================
     4. ЗАМОК: РАЗБЛОКИРОВКА + СТАРТ МУЗЫКИ
     ============================================================ */

  const lockScreen = $("#screen-lock");
  const unlockBtn = $("#unlockBtn");
  const mainContent = $("#mainContent");

  function unlock() {
    if (lockScreen.classList.contains("unlocking")) return;
    lockScreen.classList.add("unlocking");
    unlockBtn.disabled = true;
    if (CONFIG.musicSrc) {
      bgMusic.play().catch(() => { /* автоплей мог быть заблокирован — не критично */ });
    }
    // Сначала дужка замка открывается и текст уходит вверх (.unlocking, ~600мс),
    // затем весь экран мягко растворяется и слегка увеличивается (.unlocked, ~1.1с).
    setTimeout(() => {
      mainContent.hidden = false;
      lockScreen.classList.add("unlocked");
      document.body.style.overflow = "";
      // Пока mainContent был hidden, браузер ни разу не отрисовал исходное
      // opacity:0 у .reveal-item — без этого кадра переход не анимируется,
      // а элементы просто мгновенно возникают в конечном виде. Двойной
      // requestAnimationFrame гарантирует, что этот кадр состоится.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initReveal();
        });
      });
    }, 600);
  }

  document.body.style.overflow = "hidden"; // блокируем скролл, пока не разблокировано
  unlockBtn.addEventListener("click", unlock);

  /* ---------- Кнопка звука ---------- */
  soundBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      soundBtn.classList.remove("muted");
    } else {
      bgMusic.pause();
      soundBtn.classList.add("muted");
    }
  });

  /* ============================================================
     5. АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ ПРИ СКРОЛЛЕ
     ============================================================ */

  let revealInitialised = false;
  function initReveal() {
    if (revealInitialised) return;
    revealInitialised = true;

    const targets = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach(t => t.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          // календарный кружок "обводится" вместе с блоком даты
          const circleTarget = entry.target.querySelector(".cal-target");
          if (circleTarget) {
            setTimeout(() => circleTarget.classList.add("circled"), 500);
          }
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.28 });

    targets.forEach(t => io.observe(t));
  }

  /* ============================================================
     6. МОДАЛКА С АНКЕТОЙ
     ============================================================ */

  const modal = $("#rsvpModal");
  const openFormBtn = $("#openFormBtn");
  const closeFormBtn = $("#closeFormBtn");
  const modalBackdrop = $("#modalBackdrop");
  const rsvpForm = $("#rsvpForm");
  const rsvpSuccess = $("#rsvpSuccess");
  const drinksGroup = $("#drinksGroup");

  // Генерируем чекбоксы напитков из конфига
  CONFIG.drinkOptions.forEach((drink, i) => {
    const label = document.createElement("label");
    label.className = "check-row";
    label.innerHTML = `<input type="checkbox" name="drinks" value="${drink}"><span>${drink}</span>`;
    drinksGroup.appendChild(label);
  });

  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("open"));
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { modal.hidden = true; }, 400);
  }

  openFormBtn.addEventListener("click", openModal);
  closeFormBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);

  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "ОТПРАВКА…";

    const fd = new FormData(rsvpForm);
    const drinks = fd.getAll("drinks").join(", ");
    const payload = {
      timestamp: new Date().toLocaleString("ru-RU"),
      surname: fd.get("surname") || "",
      firstname: fd.get("firstname") || "",
      presence: fd.get("presence") || "",
      drinks
    };

    try {
      if (CONFIG.scriptUrl) {
        await fetch(CONFIG.scriptUrl, {
          method: "POST",
          mode: "no-cors", // Apps Script Web App не всегда шлёт CORS-заголовки; ответ нам не критичен
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
      }
      rsvpForm.hidden = true;
      rsvpSuccess.hidden = false;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "ПОДТВЕРДИТЬ";
      alert("Не удалось отправить ответ. Проверьте интернет-соединение и попробуйте ещё раз.");
    }
  });

});
