document.addEventListener("DOMContentLoaded", () => {
  // 1. Мобильное меню
  const burgerBtn = document.getElementById("burgerBtn");
  const navLinks = document.getElementById("navLinks");
  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  // 2. Переключение светлой/темной темы
  const themeBtn = document.getElementById("themeBtn");
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    if (themeBtn) themeBtn.textContent = "☀️ Светлая";
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      themeBtn.textContent = isDark ? "☀️ Светлая" : "🌙 Темная";
    });
  }

  // 3. Кнопка «Наверх»
  const toTopBtn = document.getElementById("toTopBtn");
  if (toTopBtn) {
    window.addEventListener("scroll", () => {
      toTopBtn.style.display = window.scrollY > 350 ? "inline-block" : "none";
    });
    toTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 4. Аккордеон (вопросы для самоконтроля — Задание 1)
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      item.classList.toggle("open");
      const sign = btn.querySelector(".acc-sign");
      if (sign) sign.textContent = item.classList.contains("open") ? "−" : "+";
    });
  });

  // 5. Шкала самооценки по 7 вопросам (Задание 1)
  const selfCbs = document.querySelectorAll(".self-assess-cb");
  const countEl = document.getElementById("selfAssessCount");
  const percentEl = document.getElementById("selfAssessPercent");
  const levelEl = document.getElementById("selfAssessLevel");
  const barEl = document.getElementById("selfAssessBar");

  if (selfCbs.length && countEl) {
    const updateSelfAssess = () => {
      const checked = Array.from(selfCbs).filter((cb) => cb.checked).length;
      const total = selfCbs.length;
      const pct = Math.round((checked / total) * 100);

      countEl.textContent = checked;
      percentEl.textContent = `${pct}%`;
      barEl.style.width = `${pct}%`;

      if (checked === 0) {
        levelEl.textContent = "отметьте выполненные вопросы выше";
      } else if (checked <= 3) {
        levelEl.textContent = "базовый уровень (рекомендуется повторить теорию)";
      } else if (checked <= 6) {
        levelEl.textContent = "хороший уровень владения темой";
      } else {
        levelEl.textContent = "высокий уровень — все задания выполнены!";
      }
    };

    selfCbs.forEach((cb) => cb.addEventListener("change", updateSelfAssess));
  }

  // 6. Итоговый контрольный тест (Задание 3: 7 заданий, 15 баллов + таймер)
  const finalForm = document.getElementById("finalTestForm");
  const timerEl = document.getElementById("testTimer");
  const startTimerBtn = document.getElementById("startTimerBtn");
  const resetTestBtn = document.getElementById("resetTestBtn");
  let timerInterval = null;
  let secondsLeft = 600; // 10 минут

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (startTimerBtn && timerEl) {
    startTimerBtn.addEventListener("click", () => {
      if (timerInterval) return;
      startTimerBtn.disabled = true;
      startTimerBtn.textContent = "⏱ Таймер запущен";
      timerInterval = setInterval(() => {
        secondsLeft--;
        timerEl.textContent = formatTime(Math.max(secondsLeft, 0));
        if (secondsLeft <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerEl.style.color = "var(--danger)";
          timerEl.textContent = "00:00 (время вышло)";
        }
      }, 1000);
    });
  }

  if (resetTestBtn && finalForm) {
    resetTestBtn.addEventListener("click", () => {
      finalForm.reset();
      clearInterval(timerInterval);
      timerInterval = null;
      secondsLeft = 600;
      if (timerEl) {
        timerEl.textContent = "10:00";
        timerEl.style.color = "var(--primary)";
      }
      if (startTimerBtn) {
        startTimerBtn.disabled = false;
        startTimerBtn.textContent = "▶ Запустить таймер (10 мин)";
      }
      document.querySelectorAll(".q-feedback").forEach((el) => (el.textContent = ""));
      const res = document.getElementById("finalTestResult");
      if (res) res.style.display = "none";
    });
  }

  if (finalForm) {
    const setFb = (id, ok, text) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.color = ok ? "var(--success)" : "var(--danger)";
      el.textContent = text;
    };

    finalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearInterval(timerInterval);
      timerInterval = null;

      let score = 0;

      // №1: один выбор (1 б.)
      const q1 = finalForm.querySelector('input[name="ft1"]:checked');
      if (q1 && q1.value === "b") {
        score += 1;
        setFb("fb1", true, "Верно! (+1 балл)");
      } else {
        setFb("fb1", false, "Неверно. Правильный ответ: BYOD (0 баллов)");
      }

      // №2: заполнение пропуска (1 б.)
      const q2 = document.getElementById("ft2").value.trim().toLowerCase();
      if (
        q2.includes("микрообучен") ||
        q2.includes("microlearning")
      ) {
        score += 1;
        setFb("fb2", true, "Верно! Формат микрообучения (+1 балл)");
      } else {
        setFb("fb2", false, "Неверно. Ожидался термин: «микрообучение» (0 баллов)");
      }

      // №3: множественный выбор (2 б.)
      const q3Checked = Array.from(
        finalForm.querySelectorAll('input[name="ft3"]:checked')
      ).map((i) => i.value);
      const q3Correct = ["a", "c", "d"];
      const hasWrong3 = q3Checked.some((v) => !q3Correct.includes(v));
      const rightCount3 = q3Checked.filter((v) => q3Correct.includes(v)).length;

      if (!hasWrong3 && rightCount3 === 3) {
        score += 2;
        setFb("fb3", true, "Отлично! Выбраны все 3 верные особенности (+2 балла)");
      } else if (!hasWrong3 && rightCount3 === 2) {
        score += 1;
        setFb("fb3", true, "Частично верно: 2 из 3 верных без ошибок (+1 балл)");
      } else {
        setFb("fb3", false, "Верные варианты: 1, 3 и 4 (0 баллов)");
      }

      // №4: соответствие (2 б.)
      let m4 = 0;
      if (document.getElementById("ft4a").value === "kahoot") m4++;
      if (document.getElementById("ft4b").value === "quizlet") m4++;
      if (document.getElementById("ft4c").value === "ai") m4++;
      if (m4 === 3) {
        score += 2;
        setFb("fb4", true, "Все 3 соответствия верны (+2 балла)");
      } else if (m4 === 2) {
        score += 1;
        setFb("fb4", true, "Верны 2 из 3 соответствий (+1 балл)");
      } else {
        setFb("fb4", false, "Верно: А — Kahoot!/Quizizz, Б — Quizlet/Anki, В — ИИ-тьютор (0 баллов)");
      }

      // №5: последовательность (2 б.)
      let m5 = 0;
      if (document.getElementById("ft5_1").value === "1") m5++;
      if (document.getElementById("ft5_2").value === "2") m5++;
      if (document.getElementById("ft5_3").value === "3") m5++;
      if (document.getElementById("ft5_4").value === "4") m5++;
      if (m5 === 4) {
        score += 2;
        setFb("fb5", true, "Последовательность полностью верна (+2 балла)");
      } else if (m5 >= 2) {
        score += 1;
        setFb("fb5", true, "Частично верно (допущена неточность в порядке, +1 балл)");
      } else {
        setFb("fb5", false, "Правильный порядок: 1) Диагностико-проектировочный → 2) Мотивационно-инструктивный → 3) Деятельностный → 4) Контрольно-рефлексивный (0 баллов)");
      }

      // №6: кейс-задание (3 б.)
      const q6 = finalForm.querySelector('input[name="ft6"]:checked');
      if (q6 && q6.value === "b") {
        score += 3;
        setFb("fb6", true, "Верная педагогическая стратегия! (+3 балла)");
      } else {
        setFb("fb6", false, "Оптимален 2-й вариант: короткий тайминг, парная работа и режим «Не беспокоить» (0 баллов)");
      }

      // №7: исследовательское задание по критериям (до 4 б.)
      const q7Text = document.getElementById("ft7Text").value.trim();
      const q7Checks = Array.from(document.querySelectorAll(".ft7-cb")).filter(
        (cb) => cb.checked
      ).length;

      if (q7Text.length >= 25) {
        score += q7Checks;
        setFb(
          "fb7",
          q7Checks > 0,
          `Сценарий принят! По самопроверке критериев начислено: +${q7Checks} из 4 баллов.`
        );
      } else {
        setFb(
          "fb7",
          false,
          "Напишите развернутый сценарий (от 25 символов), чтобы зачлись критерии самопроверки (0 баллов)."
        );
      }

      // Итог и оценка
      const pct = Math.round((score / 15) * 100);
      let grade = "«Неудовлетворительно»";
      if (score >= 13) grade = "«Отлично»";
      else if (score >= 10) grade = "«Хорошо»";
      else if (score >= 7) grade = "«Удовлетворительно»";

      const resultBox = document.getElementById("finalTestResult");
      resultBox.style.display = "block";
      resultBox.style.background =
        score >= 10 ? "rgba(22, 163, 74, 0.14)" : "rgba(220, 38, 38, 0.14)";
      resultBox.style.color = score >= 10 ? "var(--success)" : "var(--danger)";
      resultBox.textContent = `Итоговый результат: ${score} из 15 баллов (${pct}%). Рекомендуемая отметка: ${grade}.`;
    });
  }

  // 7. Фильтрация карточек (resources.html и examples.html)
  const filterBtns = document.querySelectorAll(".filter-btn");
  const filterItems = document.querySelectorAll("[data-category]");
  if (filterBtns.length && filterItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.filter;
        filterItems.forEach((item) => {
          item.style.display =
            cat === "all" || item.dataset.category === cat ? "block" : "none";
        });
      });
    });
  }
});