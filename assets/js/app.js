const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const root = document.documentElement;
const savedTheme = localStorage.getItem("mts-theme");
if (savedTheme) root.dataset.theme = savedTheme;

function setTheme(next) {
  root.dataset.theme = next;
  localStorage.setItem("mts-theme", next);
  $$(".theme-icon").forEach((icon) => icon.className = `fa-solid theme-icon ${next === "dark" ? "fa-sun" : "fa-moon"}`);
}

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function initShell() {
  const header = $(".site-header");
  const drawer = $(".mobile-drawer");
  const backdrop = $(".drawer-backdrop");
  const searchPanel = $(".search-panel");

  window.addEventListener("scroll", () => header?.classList.toggle("is-scrolled", window.scrollY > 12), { passive: true });
  $$(".theme-toggle").forEach((btn) => btn.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark")));
  setTheme(root.dataset.theme === "dark" ? "dark" : "light");

  $$(".menu-toggle").forEach((btn) => btn.addEventListener("click", () => {
    drawer?.classList.add("open");
    backdrop?.classList.add("open");
  }));
  $$(".drawer-close, .drawer-backdrop").forEach((el) => el.addEventListener("click", () => {
    drawer?.classList.remove("open");
    backdrop?.classList.remove("open");
  }));

  $$(".dropdown-toggle").forEach((btn) => btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    target?.classList.toggle("open");
  }));
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".dropdown-wrap")) $$(".mega-menu").forEach((menu) => menu.classList.remove("open"));
  });

  $$(".search-toggle").forEach((btn) => btn.addEventListener("click", () => {
    searchPanel?.classList.toggle("open");
    $("#site-search")?.focus();
  }));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in-view"));
  }, { threshold: 0.14 });
  $$(".reveal").forEach((el) => observer.observe(el));
}

function initHeroSlider() {
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dots button");
  const prev = $(".hero-arrow-left");
  const next = $(".hero-arrow-right");
  if (slides.length < 2) return;
  let active = 0;
  let timer;
  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === active));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === active));
  };
  const start = () => {
    clearInterval(timer);
    timer = setInterval(() => show(active + 1), 4500);
  };
  dots.forEach((dot, index) => dot.addEventListener("click", () => {
    show(index);
    start();
  }));
  prev?.addEventListener("click", () => {
    show(active - 1);
    start();
  });
  next?.addEventListener("click", () => {
    show(active + 1);
    start();
  });
  start();
}

function getData() {
  return window.MTS_DATA || { berita: [], agenda: [], pengumuman: [], galeri: [] };
}

function renderHome() {
  const data = getData();
  const news = $("#latest-news");
  if (news) {
    news.innerHTML = data.berita.slice(0, 3).map((item) => `
      <article class="card news-card reveal">
        <img loading="lazy" src="${item.image}" alt="${item.title}">
        <div class="meta"><span class="badge">${item.category}</span><span>${item.date}</span></div>
        <h3>${item.title}</h3>
        <p class="lead">${item.excerpt}</p>
        <a class="btn btn-primary" href="berita/${item.slug}.html"><i class="fa-solid fa-arrow-right"></i> Baca</a>
      </article>
    `).join("");
  }

  const announcements = $("#announcements");
  if (announcements) {
    announcements.innerHTML = data.pengumuman.map((item) => `
      <div class="list-item reveal">
        <div class="datebox">${item.day}<small>${item.month}</small></div>
        <div><strong>${item.title}</strong><p class="lead">${item.body}</p></div>
      </div>
    `).join("");
  }

  const agenda = $("#agenda-list");
  if (agenda) {
    agenda.innerHTML = data.agenda.map((item) => `
      <div class="list-item reveal">
        <div class="datebox">${item.day}<small>${item.month}</small></div>
        <div><strong>${item.title}</strong><p class="lead">${item.place}</p></div>
      </div>
    `).join("");
  }

  const gallery = $("#gallery-preview");
  if (gallery) {
    gallery.innerHTML = data.galeri.slice(0, 4).map((item) => `
      <a class="gallery-item reveal" href="galeri/index.html">
        <img loading="lazy" src="${item.image}" alt="${item.title}">
      </a>
    `).join("");
  }
}

function renderNewsPage() {
  const list = $("#news-list");
  if (!list) return;
  const data = getData();
  const search = $("#news-search");
  const category = $("#news-category");
  const paint = () => {
    const q = (search?.value || "").toLowerCase();
    const cat = category?.value || "all";
    const items = data.berita.filter((item) => (cat === "all" || item.category === cat) && item.title.toLowerCase().includes(q));
    list.innerHTML = items.map((item) => `
      <article class="card news-card">
        <img loading="lazy" src="${item.image}" alt="${item.title}">
        <div class="meta"><span class="badge">${item.category}</span><span>${item.date}</span></div>
        <h3>${item.title}</h3>
        <p class="lead">${item.excerpt}</p>
        <a class="btn btn-primary" href="${item.slug}.html"><i class="fa-solid fa-arrow-right"></i> Detail</a>
      </article>
    `).join("") || `<div class="alert">Berita tidak ditemukan.</div>`;
  };
  search?.addEventListener("input", paint);
  category?.addEventListener("change", paint);
  paint();
}

function renderNewsDetail() {
  const detail = $("#news-detail");
  if (!detail) return;
  const pathSlug = location.pathname.split("/").pop()?.replace(".html", "");
  const slug = new URLSearchParams(location.search).get("slug") || (pathSlug === "detail" ? "" : pathSlug);
  const data = getData();
  const item = data.berita.find((news) => news.slug === slug) || data.berita[0];
  document.title = `${item.title} | MTs Hidayatul Mubtadiin`;
  detail.innerHTML = `
    <img src="${item.image}" alt="${item.title}" style="width:100%;max-height:460px;object-fit:cover;border-radius:18px;box-shadow:var(--shadow)">
    <div class="meta" style="margin-top:18px"><span class="badge">${item.category}</span><span>${item.date}</span></div>
    <h1>${item.title}</h1>
    <p class="lead">${item.excerpt}</p>
    <p>${item.content}</p>
  `;
  const related = $("#related-posts");
  if (related) related.innerHTML = data.berita.filter((news) => news.slug !== item.slug).slice(0, 3).map((news) => `
    <a class="card" href="${news.slug}.html"><strong>${news.title}</strong><p class="lead">${news.excerpt}</p></a>
  `).join("");
}

function renderGalleryPage() {
  const grid = $("#gallery-grid");
  if (!grid) return;
  const data = getData();
  const filter = $("#gallery-filter");
  const lightbox = $("#lightbox");
  const paint = () => {
    const cat = filter?.value || "all";
    grid.innerHTML = data.galeri.filter((item) => cat === "all" || item.category === cat).map((item) => `
      <button class="gallery-item card" data-src="${item.image}" data-title="${item.title}" style="border:0;text-align:left;cursor:pointer">
        <img loading="lazy" src="${item.image}" alt="${item.title}">
        <strong>${item.title}</strong>
      </button>
    `).join("");
  };
  filter?.addEventListener("change", paint);
  grid.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-src]");
    if (!btn) return;
    lightbox.innerHTML = `<div class="modal-card" style="max-width:920px"><button class="icon-btn" aria-label="Tutup lightbox"><i class="fa-solid fa-xmark"></i></button><img src="${btn.dataset.src}" alt="${btn.dataset.title}" style="border-radius:14px;margin-top:12px"><h3>${btn.dataset.title}</h3></div>`;
    lightbox.classList.add("open");
  });
  lightbox?.addEventListener("click", () => lightbox.classList.remove("open"));
  paint();
}

function initPPDB() {
  const form = $("#ppdb-form");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = $("#ppdb-status");
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.nama || !data.nisn || !data.wa) {
      status.textContent = "Lengkapi nama, NISN, dan nomor WhatsApp.";
      return;
    }
    status.textContent = "Mengirim data pendaftaran...";
    window.dispatchEvent(new CustomEvent("mts:ppdb-submit", { detail: data }));
    await new Promise((resolve) => setTimeout(resolve, 900));
    status.textContent = "Pendaftaran berhasil disiapkan. WhatsApp admin akan dibuka.";
    $("#success-modal")?.classList.add("open");
    const msg = encodeURIComponent("Halo admin sekolah, saya telah mendaftar PPDB");
    window.open(`https://wa.me/6285649225250?text=${msg}`, "_blank");
    form.reset();
  });
  $$(".modal-close").forEach((btn) => btn.addEventListener("click", () => btn.closest(".modal")?.classList.remove("open")));
}

document.addEventListener("DOMContentLoaded", () => {
  initShell();
  initHeroSlider();
  renderHome();
  renderNewsPage();
  renderNewsDetail();
  renderGalleryPage();
  initPPDB();
});

