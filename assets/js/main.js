document.addEventListener("DOMContentLoaded", function () {
  // Cost calculator: hours[type][complexity] x rate, no hidden logic.
  var calcRoot = document.querySelector(".calc-card");
  if (calcRoot) {
    var RATE = 2600;
    var HOURS = {
      fasttrack: { simple: [8, 16], medium: [16, 30], hard: [30, 50] },
      standard:  { simple: [30, 60], medium: [60, 150], hard: [150, 350] },
      research:  { simple: [60, 120], medium: [120, 300], hard: [300, 600] }
    };
    var NOTES = {
      fasttrack: "Fast Track: типовой договор, аванс, результат — презентация",
      standard: "Стандартный расчётный проект с отчётом по результатам",
      research: "НИР — научно-исследовательская работа, без НДС"
    };
    var typeWrap = calcRoot.querySelector("[data-calc-type]");
    var complexityWrap = calcRoot.querySelector("[data-calc-complexity]");
    var noteEl = calcRoot.querySelector("[data-calc-note]");
    var minEl = calcRoot.querySelector("[data-calc-min]");
    var maxEl = calcRoot.querySelector("[data-calc-max]");
    var hoursEl = calcRoot.querySelector("[data-calc-hours]");

    function fmt(n) { return n.toLocaleString("ru-RU"); }

    function recalc() {
      var type = typeWrap.querySelector(".is-active").getAttribute("data-value");
      var complexity = complexityWrap.querySelector(".is-active").getAttribute("data-value");
      var hours = HOURS[type][complexity];
      noteEl.textContent = NOTES[type];
      minEl.textContent = fmt(hours[0] * RATE);
      maxEl.textContent = fmt(hours[1] * RATE);
      hoursEl.textContent = "≈ " + hours[0] + "–" + hours[1] + " часов работы инженера";
    }

    [typeWrap, complexityWrap].forEach(function (wrap) {
      wrap.querySelectorAll(".calc-option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          wrap.querySelectorAll(".calc-option").forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          recalc();
        });
      });
    });

    recalc();
  }

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
      });
    });
  }

  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var success = form.parentElement.querySelector(".form-success");
      if (success) {
        success.classList.add("is-visible");
      }
      form.reset();
    });
  });

  // Multi-item track carousel: arrows + dots, responsive items-per-view
  // inferred from rendered item width, optional autoplay.
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var viewport = root.querySelector(".carousel-viewport");
    var track = root.querySelector(".carousel-track");
    var items = Array.prototype.slice.call(track.children);
    var prevBtn = root.querySelector(".carousel-prev");
    var nextBtn = root.querySelector(".carousel-next");
    var dotsWrap = root.querySelector(".carousel-dots");
    var autoplay = root.getAttribute("data-autoplay") === "true";
    var interval = parseInt(root.getAttribute("data-interval"), 10) || 6000;
    var page = 0, pages = 1, timer = null;

    function buildDots() {
      dotsWrap.innerHTML = "";
      for (var i = 0; i < pages; i++) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "carousel-dot" + (i === page ? " is-active" : "");
        d.setAttribute("aria-label", "Слайд " + (i + 1));
        (function (idx) {
          d.addEventListener("click", function () {
            go(idx);
            resetTimer();
          });
        })(i);
        dotsWrap.appendChild(d);
      }
    }

    function go(i, animate) {
      page = ((i % pages) + pages) % pages;
      if (animate === false) track.style.transition = "none";
      track.style.transform = "translateX(-" + page * viewport.clientWidth + "px)";
      if (animate === false) {
        requestAnimationFrame(function () {
          track.style.transition = "";
        });
      }
      Array.prototype.forEach.call(dotsWrap.children, function (d, idx) {
        d.classList.toggle("is-active", idx === page);
      });
    }

    function measure() {
      if (!items.length) return;
      var perView = Math.max(1, Math.round(viewport.clientWidth / items[0].getBoundingClientRect().width));
      pages = Math.max(1, Math.ceil(items.length / perView));
      page = Math.min(page, pages - 1);
      buildDots();
      go(page, false);
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      if (autoplay) timer = setInterval(function () { go(page + 1); }, interval);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { go(page - 1); resetTimer(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(page + 1); resetTimer(); });
    root.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    root.addEventListener("mouseleave", resetTimer);

    window.addEventListener("resize", measure);
    measure();
    resetTimer();
  });

  // Fade carousel for the hero image: auto-advances, optional dots.
  document.querySelectorAll("[data-hero-carousel]").forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dotsWrap = root.querySelector(".carousel-dots");
    var interval = parseInt(root.getAttribute("data-interval"), 10) || 5000;
    var idx = 0;
    if (slides.length < 2) return;

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "carousel-dot" + (i === 0 ? " is-active" : "");
        d.setAttribute("aria-label", "Изображение " + (i + 1));
        d.addEventListener("click", function () { show(i); resetTimer(); });
        dotsWrap.appendChild(d);
      });
    }

    function show(i) {
      slides[idx].classList.remove("is-active");
      if (dotsWrap) dotsWrap.children[idx].classList.remove("is-active");
      idx = ((i % slides.length) + slides.length) % slides.length;
      slides[idx].classList.add("is-active");
      if (dotsWrap) dotsWrap.children[idx].classList.add("is-active");
    }

    var timer = null;
    function resetTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { show(idx + 1); }, interval);
    }
    root.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    root.addEventListener("mouseleave", resetTimer);
    resetTimer();
  });
});
