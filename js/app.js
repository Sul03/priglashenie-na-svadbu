/* ============================================================
   Логика сайта-приглашения. Весь контент берётся из CONFIG (config.js).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Утилиты ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const WEEKDAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  // Тюмень, UTC+5 — все даты/время показываем по месту проведения,
  // а не по часовому поясу телефона гостя.
  const TZ = "Asia/Yekaterinburg";

  const weddingDate = new Date(CONFIG.date);


  /* ============================================================
     1. ЗАПОЛНЕНИЕ КОНТЕНТА ИЗ CONFIG
     ============================================================ */

  const setText = (sel, text) => $$(sel).forEach(el => { el.textContent = text; });

  const timeText = weddingDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  const weekdayText = weddingDate.toLocaleDateString("ru-RU", { weekday: "long", timeZone: TZ }).toUpperCase();
  const dayMonthText = weddingDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: TZ });

  setText(".date-short", weddingDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ }));
  setText(".names-en", CONFIG.names.en);
  setText(".date-caps", CONFIG.dateText);
  setText(".weekday", weekdayText);
  setText(".venue-time", timeText);
  setText(".venue-title", CONFIG.venue.title);
  setText(".venue-when", dayMonthText + " · начало в " + timeText);
  setText(".venue-address", CONFIG.venue.address);
  setText("#rsvpDeadline", "до " + CONFIG.rsvpDeadline);
  setText("#finalNames", CONFIG.names.ru);

  $("#mapLink").href = CONFIG.venue.mapUrl;

  const venuePhoto = $("#venuePhoto");
  if (CONFIG.venue.photo) {
    venuePhoto.src = CONFIG.venue.photo;
    venuePhoto.onerror = () => { venuePhoto.parentElement.style.display = "none"; };
  } else {
    venuePhoto.parentElement.style.display = "none";
  }

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
    cal.innerHTML = "";

    const year = weddingDate.getFullYear();
    const month = weddingDate.getMonth();
    const targetDay = weddingDate.getDate();

    const firstOfMonth = new Date(year, month, 1);
    let firstWeekday = firstOfMonth.getDay(); // 0=вс
    firstWeekday = firstWeekday === 0 ? 7 : firstWeekday; // 1=пн..7=вс
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    WEEKDAYS_RU.forEach(w => {
      const el = document.createElement("div");
      el.className = "cal-day cal-weekday";
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
     3. «РОЛИК» — СЦЕНЫ, КАК СТОРИС
     ============================================================ */

  const film = $("#film");
  const scenes = $$(".scene", film);
  const progress = $("#filmProgress");
  const filmHint = $("#filmHint");
  const rsvpPage = $("#rsvpPage");

  // Полоски прогресса — по одной на сцену
  const bars = scenes.map(() => {
    const bar = document.createElement("span");
    bar.className = "film-bar";
    bar.appendChild(document.createElement("i"));
    progress.appendChild(bar);
    return bar;
  });

  let current = -1;
  let sceneTimer = null;
  let leaveTimers = new Map();

  // Перезапуск CSS-анимаций: снять класс, принудительно пересчитать
  // стили (чтение offsetWidth) и навесить снова — иначе при повторном
  // показе сцены браузер посчитает анимацию уже отыгранной.
  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function showScene(i) {
    if (i < 0 || i >= scenes.length) return;
    clearTimeout(sceneTimer);

    if (current >= 0 && current !== i) {
      // Уходящая сцена: .leaving удерживает её анимации в конечном
      // состоянии, пока она плавно растворяется — без этого текст
      // исчез бы мгновенно, а не вместе со сценой.
      const old = scenes[current];
      old.classList.add("leaving");
      old.classList.remove("active");
      clearTimeout(leaveTimers.get(old));
      leaveTimers.set(old, setTimeout(() => old.classList.remove("leaving"), 1000));
    }

    const scene = scenes[i];
    clearTimeout(leaveTimers.get(scene));
    scene.classList.remove("leaving");
    restart(scene, "active");
    current = i;

    bars.forEach((bar, j) => {
      bar.classList.toggle("done", j < i);
      bar.classList.remove("running");
    });
    const dur = Number(scene.dataset.dur) || 7000;
    bars[i].style.setProperty("--dur", dur + "ms");
    restart(bars[i], "running");

    // Последняя сцена сама не перелистывается — ждёт нажатия кнопки
    if (i < scenes.length - 1) {
      sceneTimer = setTimeout(() => showScene(i + 1), dur);
    }
    filmHint.classList.toggle("gone", i > 0);
  }

  function startFilm() {
    film.hidden = false;
    film.classList.remove("closing");
    document.body.style.overflow = "hidden";
    current = -1;
    scenes.forEach(s => s.classList.remove("active", "leaving"));
    // Двойной rAF — чтобы браузер успел отрисовать исходное (скрытое)
    // состояние сцены, иначе первая анимация не проигрывается.
    requestAnimationFrame(() => requestAnimationFrame(() => showScene(0)));
  }

  // Тап по экрану: левая треть — назад, остальное — вперёд.
  // Кнопки, ссылки и карту не перехватываем.
  film.addEventListener("click", (e) => {
    if (e.target.closest("a, button, iframe, .map-wrap")) return;
    const x = e.clientX / window.innerWidth;
    if (x < 0.3) {
      showScene(current - 1);
    } else if (current < scenes.length - 1) {
      showScene(current + 1);
    }
  });

  /* ---------- Переход к анкете и обратно ---------- */

  $("#toRsvpBtn").addEventListener("click", () => {
    clearTimeout(sceneTimer);
    film.classList.add("closing");
    setTimeout(() => {
      film.hidden = true;
      rsvpPage.hidden = false;
      document.body.style.overflow = "";
      window.scrollTo(0, 0);
      requestAnimationFrame(() => requestAnimationFrame(() => restart(rsvpPage, "in")));
    }, 700);
  });

  $("#replayBtn").addEventListener("click", () => {
    rsvpPage.hidden = true;
    rsvpPage.classList.remove("in");
    window.scrollTo(0, 0);
    startFilm();
  });

  /* ============================================================
     4. ЗАМОК: РАЗБЛОКИРОВКА + СТАРТ МУЗЫКИ
     ============================================================ */

  const lockScreen = $("#screen-lock");
  const unlockBtn = $("#unlockBtn");

  function unlock() {
    if (lockScreen.classList.contains("unlocking")) return;
    lockScreen.classList.add("unlocking");
    unlockBtn.disabled = true;
    if (CONFIG.musicSrc) {
      bgMusic.play().catch(() => { /* автоплей мог быть заблокирован — не критично */ });
    }
    // Карту начинаем грузить заранее, чтобы к сцене «Локация» она уже была готова
    $("#venueMap").src = "https://yandex.ru/map-widget/v1/?mode=search&z=16&text=" +
      encodeURIComponent(CONFIG.venue.address);

    // Сначала дужка замка открывается и текст уходит вверх (.unlocking, ~600мс),
    // затем экран замка растворяется, а под ним запускается ролик.
    setTimeout(() => {
      lockScreen.classList.add("unlocked");
      startFilm();
    }, 600);
  }

  document.body.style.overflow = "hidden";
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
     5. АНКЕТА
     ============================================================ */

  const rsvpForm = $("#rsvpForm");
  const rsvpSuccess = $("#rsvpSuccess");

  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "ОТПРАВКА…";

    const fd = new FormData(rsvpForm);
    const payload = {
      timestamp: new Date().toLocaleString("ru-RU"),
      surname: fd.get("surname") || "",
      firstname: fd.get("firstname") || "",
      presence: fd.get("presence") || ""
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
