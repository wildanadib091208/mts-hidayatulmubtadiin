const storeKey = "mts-admin-data";
const initial = {
  berita: window.MTS_DATA?.berita || [],
  galeri: window.MTS_DATA?.galeri || [],
  agenda: window.MTS_DATA?.agenda || [],
  ppdb: [
    { nama: "Ahmad Fauzan", nisn: "0098765432", wa: "6281234567890", status: "Baru" },
    { nama: "Siti Aminah", nisn: "0098765433", wa: "6281234567891", status: "Diverifikasi" }
  ]
};
let adminData = JSON.parse(localStorage.getItem(storeKey) || "null") || initial;

function saveAdminData() {
  localStorage.setItem(storeKey, JSON.stringify(adminData));
  window.dispatchEvent(new CustomEvent("mts:admin-save", { detail: adminData }));
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderStats() {
  document.getElementById("stat-berita").textContent = adminData.berita.length;
  document.getElementById("stat-galeri").textContent = adminData.galeri.length;
  document.getElementById("stat-agenda").textContent = adminData.agenda.length;
  document.getElementById("stat-ppdb").textContent = adminData.ppdb.length;
}

function renderCrud(type) {
  const tbody = document.getElementById(`${type}-table`);
  if (!tbody) return;
  tbody.innerHTML = adminData[type].map((item, index) => `
    <tr>
      <td>${item.title}</td>
      <td>${item.category || item.day + " " + item.month}</td>
      <td><button class="btn" data-edit="${type}:${index}">Edit</button> <button class="btn" data-delete="${type}:${index}">Hapus</button></td>
    </tr>
  `).join("");
}

function renderPpdb() {
  const tbody = document.getElementById("ppdb-table");
  if (!tbody) return;
  const q = (document.getElementById("ppdb-search")?.value || "").toLowerCase();
  const filter = document.getElementById("ppdb-filter")?.value || "all";
  tbody.innerHTML = adminData.ppdb.filter((item) => (filter === "all" || item.status === filter) && `${item.nama} ${item.nisn}`.toLowerCase().includes(q)).map((item) => `
    <tr><td>${item.nama}</td><td>${item.nisn}</td><td>${item.wa}</td><td><span class="badge">${item.status}</span></td></tr>
  `).join("");
}

function bindCrud(type) {
  const form = document.getElementById(`${type}-form`);
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const id = values.id;
    delete values.id;
    if (type === "berita") values.slug = slug(values.title);
    if (id) adminData[type][Number(id)] = values;
    else adminData[type].unshift(values);
    form.reset();
    saveAdminData();
    renderAll();
  });
}

function renderAll() {
  renderStats();
  ["berita", "galeri", "agenda"].forEach(renderCrud);
  renderPpdb();
}

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("mts-auth-role")) location.href = "../login/index.html";
  document.querySelectorAll("[data-panel]").forEach((btn) => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-panel]").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".admin-panel").forEach((panel) => panel.hidden = true);
    btn.classList.add("active");
    document.getElementById(`panel-${btn.dataset.panel}`).hidden = false;
  }));
  ["berita", "galeri", "agenda"].forEach(bindCrud);
  document.body.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]")?.dataset.edit;
    const del = event.target.closest("[data-delete]")?.dataset.delete;
    if (edit) {
      const [type, index] = edit.split(":");
      const form = document.getElementById(`${type}-form`);
      Object.entries(adminData[type][Number(index)]).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
      form.elements.id.value = index;
    }
    if (del) {
      const [type, index] = del.split(":");
      adminData[type].splice(Number(index), 1);
      saveAdminData();
      renderAll();
    }
  });
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("mts-auth-role");
    location.href = "../login/index.html";
  });
  document.getElementById("ppdb-search")?.addEventListener("input", renderPpdb);
  document.getElementById("ppdb-filter")?.addEventListener("change", renderPpdb);
  renderAll();
});
