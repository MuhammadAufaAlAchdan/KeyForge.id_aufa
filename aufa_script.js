/* ==========================================================================
   KeyForge.id - JavaScript Utama
   Muhammad Aufa Al Achdan (2403010063) - Kelas C
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Utilitas DOM & Format Rupiah
     ------------------------------------------------------------------------ */
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const formatRupiah = (amount) => "Rp " + Number(amount).toLocaleString("id-ID");

  /* ------------------------------------------------------------------------
     Notifikasi Toast
     ------------------------------------------------------------------------ */
  let toastTimer = null;

  function showToast(message) {
    const toastEl = $("#aufa_toast");
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add("aufa_open");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("aufa_open");
    }, 2200);
  }

  /* ------------------------------------------------------------------------
     Tema Terang / Gelap & Efek Scroll Header
     ------------------------------------------------------------------------ */
  const rootEl = document.documentElement;
  const themeBtn = $("#aufa_theme_btn");
  const themeIcon = $("#aufa_theme_icon");
  const headerEl = $("#aufa_header");

  function getSavedTheme() {
    try {
      return localStorage.getItem("aufa_theme") || "dark";
    } catch (err) {
      return "dark";
    }
  }

  function applyTheme(theme) {
    rootEl.setAttribute("data-theme", theme);
    if (themeIcon) {
      themeIcon.innerHTML = theme === "light" ? "&#9790;" : "&#9728;";
    }
  }

  applyTheme(getSavedTheme());

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const nextTheme = rootEl.getAttribute("data-theme") === "light" ? "dark" : "light";

      try {
        localStorage.setItem("aufa_theme", nextTheme);
      } catch (err) {
        // Abaikan jika localStorage tidak tersedia
      }

      applyTheme(nextTheme);
      showToast("Mode " + (nextTheme === "light" ? "terang" : "gelap") + " aktif");
    });
  }

  if (headerEl) {
    window.addEventListener("scroll", () => {
      headerEl.classList.toggle("aufa_scrolled", window.scrollY > 10);
    });
  }

  /* ------------------------------------------------------------------------
     Formulir Newsletter
     ------------------------------------------------------------------------ */
  const newsForm = $("#aufa_news_form");
  if (newsForm) {
    newsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = $("#aufa_news_email");
      if (!emailInput) return;

      const email = emailInput.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Masukkan email yang valid");
        return;
      }

      showToast("Terima kasih! Voucher dikirim ke " + email);
      emailInput.value = "";
    });
  }

  /* ------------------------------------------------------------------------
     Menu Navigasi Mobile
     ------------------------------------------------------------------------ */
  const burgerBtn = $("#aufa_burger");
  const navMenu = $("#aufa_nav");

  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener("click", () => {
      navMenu.classList.toggle("aufa_open");
    });
  }

  /* ------------------------------------------------------------------------
     Keranjang Belanja (localStorage)
     ------------------------------------------------------------------------ */
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("aufa_cart")) || [];
  } catch (err) {
    cart = [];
  }

  const cartDrawer = $("#aufa_cart");
  const cartList = $("#aufa_cart_list");
  const cartTotal = $("#aufa_cart_total");
  const cartCount = $("#aufa_cart_count");
  const cartBtn = $("#aufa_cart_btn");
  const cartCloseBtn = $("#aufa_cart_close");
  const clearCartBtn = $("#aufa_clear");
  const checkoutBtn = $("#aufa_checkout");

  function saveCart() {
    try {
      localStorage.setItem("aufa_cart", JSON.stringify(cart));
    } catch (err) {
      // Abaikan jika localStorage tidak tersedia
    }
    renderCart();
  }

  function renderCart() {
    if (!cartList || !cartTotal || !cartCount) return;

    let totalPrice = 0;
    let totalQty = 0;
    cartList.innerHTML = "";

    if (!cart.length) {
      cartList.innerHTML = "<li>Keranjang masih kosong.</li>";
    } else {
      cart.forEach((item, index) => {
        totalPrice += item.price * item.qty;
        totalQty += item.qty;

        const li = document.createElement("li");
        li.innerHTML =
          `<span>${item.name}<br><small>${formatRupiah(item.price)}</small></span>` +
          `<span>` +
          `<button type="button" data-i="${index}" data-d="-1">-</button> ` +
          `${item.qty} ` +
          `<button type="button" data-i="${index}" data-d="1">+</button>` +
          `</span>`;
        cartList.appendChild(li);
      });
    }

    cartTotal.textContent = formatRupiah(totalPrice);
    cartCount.textContent = totalQty;
  }

  if (cartList) {
    cartList.addEventListener("click", (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;

      const index = Number(btn.dataset.i);
      const delta = Number(btn.dataset.d);

      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }

      saveCart();
    });
  }

  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener("click", () => {
      cartDrawer.classList.add("aufa_open");
    });
  }

  if (cartCloseBtn && cartDrawer) {
    cartCloseBtn.addEventListener("click", () => {
      cartDrawer.classList.remove("aufa_open");
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      cart = [];
      saveCart();
    });
  }

  if (checkoutBtn && cartDrawer) {
    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) {
        showToast("Keranjang masih kosong");
        return;
      }

      cart = [];
      saveCart();
      cartDrawer.classList.remove("aufa_open");
      showToast("Terima kasih! Pesanan diproses (demo)");
    });
  }

  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest(".aufa_add");
    if (!addBtn) return;

    const id = addBtn.dataset.id;
    const existing = cart.find((item) => item.id === id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id,
        name: addBtn.dataset.name,
        price: Number(addBtn.dataset.price),
        qty: 1
      });
    }

    saveCart();
    showToast(addBtn.dataset.name + " ditambahkan");
  });

  renderCart();

  /* ------------------------------------------------------------------------
     Tombol Kembali ke Atas & Animasi Scroll Reveal
     ------------------------------------------------------------------------ */
  const topBtn = $("#aufa_top");

  if (topBtn) {
    window.addEventListener("scroll", () => {
      topBtn.style.display = window.scrollY > 400 ? "block" : "none";
    });

    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("aufa_visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  $$(".aufa_card, .aufa_feature, .aufa_step, .aufa_shot, .aufa_stats div").forEach((el) => {
    el.classList.add("aufa_reveal");
    revealObserver.observe(el);
  });

  /* ------------------------------------------------------------------------
     Halaman Home: Efek Mengetik, Keyboard Interaktif, Counter & Slider
     ------------------------------------------------------------------------ */
  const typedEl = $("#aufa_typed");
  if (typedEl) {
    // 1. Efek mengetik
    const words = [
      "switch linear yang halus",
      "keycaps PBT bertema neon",
      "jasa rakit & lube profesional"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function runTyping() {
      const currentWord = words[wordIndex];
      typedEl.textContent = currentWord.substring(0, charIndex);

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(runTyping, 1400);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }

      charIndex += isDeleting ? -1 : 1;
      setTimeout(runTyping, isDeleting ? 35 : 80);
    }

    runTyping();

    // 2. Keyboard interaktif
    function toggleVirtualKey(keyChar, isActive) {
      const keyEl = $(`.aufa_key[data-key="${keyChar}"]`);
      if (keyEl) {
        keyEl.classList.toggle("aufa_lit", isActive);
      }
    }

    document.addEventListener("keydown", (event) => {
      toggleVirtualKey(event.key.toUpperCase(), true);
    });

    document.addEventListener("keyup", (event) => {
      toggleVirtualKey(event.key.toUpperCase(), false);
    });

    $$(".aufa_key").forEach((keyEl) => {
      keyEl.addEventListener("mousedown", () => keyEl.classList.add("aufa_lit"));
      keyEl.addEventListener("mouseup", () => keyEl.classList.remove("aufa_lit"));
      keyEl.addEventListener("mouseleave", () => keyEl.classList.remove("aufa_lit"));
    });

    // 3. Animasi angka statistik
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const targetEl = entry.target;
        const targetValue = Number(targetEl.dataset.to);
        let currentValue = 0;

        const timer = setInterval(() => {
          currentValue += Math.ceil(targetValue / 50);
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
          }
          targetEl.textContent = currentValue.toLocaleString("id-ID");
        }, 30);

        counterObserver.unobserve(targetEl);
      });
    });

    $$(".aufa_count_up").forEach((el) => counterObserver.observe(el));

    // 4. Slider testimoni
    const slides = $$(".aufa_slide");
    if (slides.length > 1) {
      let slideIndex = 0;
      setInterval(() => {
        slides[slideIndex].classList.remove("aufa_show");
        slideIndex = (slideIndex + 1) % slides.length;
        slides[slideIndex].classList.add("aufa_show");
      }, 4000);
    }
  }

  /* ------------------------------------------------------------------------
     Halaman Katalog (Switch & Keycaps): Pencarian, Filter & Urutkan
     ------------------------------------------------------------------------ */
  const catalogGrid = $("#aufa_grid");
  if (catalogGrid) {
    const originalCards = $$(".aufa_card", catalogGrid);
    const searchInput = $("#aufa_search");
    const filterSelect = $("#aufa_filter");
    const sortSelect = $("#aufa_sort");
    const countText = $("#aufa_count");
    const emptyText = $("#aufa_empty");

    function updateCatalog() {
      const query = searchInput.value.toLowerCase();
      const filterType = filterSelect.value;
      const sortMode = sortSelect.value;
      const sortedCards = originalCards.slice();
      let visibleCount = 0;

      if (sortMode === "asc") {
        sortedCards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
      } else if (sortMode === "desc") {
        sortedCards.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
      } else if (sortMode === "az") {
        sortedCards.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
      }

      sortedCards.forEach((card) => {
        const matchesQuery = card.dataset.name.includes(query);
        const matchesType = filterType === "all" || card.dataset.type === filterType;
        const isVisible = matchesQuery && matchesType;

        card.style.display = isVisible ? "" : "none";
        if (isVisible) visibleCount += 1;
        catalogGrid.appendChild(card);
      });

      countText.textContent = `Menampilkan ${visibleCount} dari ${originalCards.length} produk`;
      emptyText.style.display = visibleCount ? "none" : "block";
    }

    ["input", "change"].forEach((eventName) => {
      searchInput.addEventListener(eventName, updateCatalog);
      filterSelect.addEventListener(eventName, updateCatalog);
      sortSelect.addEventListener(eventName, updateCatalog);
    });

    updateCatalog();
  }

  /* ------------------------------------------------------------------------
     Halaman Panduan: Checklist Progres & Kalkulator Budget
     ------------------------------------------------------------------------ */
  const stepChecks = $$(".aufa_check");
  if (stepChecks.length) {
    const progressBar = $("#aufa_bar");
    const progressText = $("#aufa_prog_txt");
    const budgetInputs = $$(".aufa_bud");
    const budgetTotal = $("#aufa_budget");

    function updateProgress() {
      const completed = stepChecks.filter((cb) => cb.checked).length;
      const percent = (completed / stepChecks.length) * 100;

      progressBar.style.width = percent + "%";
      progressText.textContent =
        `${completed} dari ${stepChecks.length} langkah selesai` +
        (completed === stepChecks.length ? " - Selamat!" : "");
    }

    function updateBudget() {
      const total = budgetInputs.reduce((sum, input) => sum + (Number(input.value) || 0), 0);
      budgetTotal.textContent = formatRupiah(total);
    }

    stepChecks.forEach((cb) => cb.addEventListener("change", updateProgress));
    budgetInputs.forEach((input) => input.addEventListener("input", updateBudget));

    updateBudget();
  }

  /* ------------------------------------------------------------------------
     Halaman Galeri: Filter Kategori & Modal Detail
     ------------------------------------------------------------------------ */
  const galleryGrid = $("#aufa_gallery");
  if (galleryGrid) {
    const modalEl = $("#aufa_modal");
    const modalVis = $("#aufa_modal_vis");
    const modalTitle = $("#aufa_modal_t");
    const modalDesc = $("#aufa_modal_d");
    const modalCloseBtn = $("#aufa_modal_x");

    function renderMiniKeyboard(container, colorsCsv) {
      container.innerHTML = "";
      const colors = colorsCsv.split(",");

      for (let i = 0; i < 30; i += 1) {
        const keyTile = document.createElement("i");
        keyTile.style.background = colors[(i * 7 + (i % 3)) % colors.length];
        keyTile.style.opacity = i % 5 === 0 ? "1" : "0.75";
        container.appendChild(keyTile);
      }
    }

    function closeModal() {
      modalEl.classList.remove("aufa_open");
    }

    $$(".aufa_shot").forEach((shotEl) => {
      renderMiniKeyboard($(".aufa_mini", shotEl), shotEl.dataset.cols);

      shotEl.addEventListener("click", () => {
        renderMiniKeyboard(modalVis, shotEl.dataset.cols);
        modalTitle.textContent = shotEl.dataset.title;
        modalDesc.textContent = shotEl.dataset.desc;
        modalEl.classList.add("aufa_open");
      });
    });

    $$(".aufa_tab").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        $$(".aufa_tab").forEach((btn) => btn.classList.remove("aufa_on"));
        tabBtn.classList.add("aufa_on");

        const category = tabBtn.dataset.cat;
        $$(".aufa_shot").forEach((shotEl) => {
          const isMatch = category === "all" || shotEl.dataset.cat === category;
          shotEl.style.display = isMatch ? "" : "none";
        });
      });
    });

    modalCloseBtn.addEventListener("click", closeModal);
    modalEl.addEventListener("click", (event) => {
      if (event.target.id === "aufa_modal") closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  /* ------------------------------------------------------------------------
     Halaman FAQ: Accordion & Pencarian Pertanyaan
     ------------------------------------------------------------------------ */
  $$(".aufa_q").forEach((questionBtn) => {
    questionBtn.addEventListener("click", () => {
      const faqItem = questionBtn.parentNode;
      const answerEl = $(".aufa_a", faqItem);
      const isOpen = faqItem.classList.toggle("aufa_open");

      answerEl.style.maxHeight = isOpen ? answerEl.scrollHeight + 40 + "px" : null;
      questionBtn.setAttribute("aria-expanded", String(isOpen));
    });
  });

  const faqSearch = $("#aufa_faq_search");
  if (faqSearch) {
    faqSearch.addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase();
      $$(".aufa_faq").forEach((faqItem) => {
        const isMatch = faqItem.textContent.toLowerCase().includes(query);
        faqItem.style.display = isMatch ? "" : "none";
      });
    });
  }

  /* ------------------------------------------------------------------------
     Halaman Kontak: Validasi Form & Kirim Email
     ------------------------------------------------------------------------ */
  const contactForm = $("#aufa_form");
  if (contactForm) {
    const messageInput = $("#aufa_pesan");
    const charCounter = $("#aufa_char");
    const statusText = $("#aufa_ok");

    messageInput.addEventListener("input", () => {
      charCounter.textContent = `${messageInput.value.length}/500`;
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const validationRules = [
        {
          selector: "#aufa_nama",
          validate: (val) => val.trim().length >= 3,
          message: "Nama minimal 3 karakter"
        },
        {
          selector: "#aufa_email",
          validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
          message: "Format email tidak valid"
        },
        {
          selector: "#aufa_pesan",
          validate: (val) => val.trim().length >= 10,
          message: "Pesan minimal 10 karakter"
        }
      ];

      let isValid = true;
      validationRules.forEach((rule) => {
        const inputEl = $(rule.selector);
        const errorEl = inputEl.nextElementSibling;
        const passed = rule.validate(inputEl.value);

        inputEl.classList.toggle("aufa_invalid", !passed);
        errorEl.textContent = passed ? "" : rule.message;
        if (!passed) isValid = false;
      });

      if (!isValid) return;

      const nama = $("#aufa_nama").value.trim();
      const email = $("#aufa_email").value.trim();
      const topik = $("#aufa_topik").value;
      const subject = encodeURIComponent(`[KeyForge] ${topik} - ${nama}`);
      const body = encodeURIComponent(`${messageInput.value}\n\nDari: ${nama} (${email})`);

      statusText.textContent = `Terima kasih, ${nama}! Pesanmu siap dikirim melalui aplikasi email.`;
      window.location.href = `mailto:hello@keyforge.id?subject=${subject}&body=${body}`;

      contactForm.reset();
      charCounter.textContent = "0/500";
    });
  }
})();
