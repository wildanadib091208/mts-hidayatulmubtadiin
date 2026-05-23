document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("login-status");
  const adminForm = document.getElementById("admin-login");
  const siswaForm = document.getElementById("siswa-login");

  document.querySelectorAll("[data-login-tab]").forEach((tab) => tab.addEventListener("click", () => {
    document.querySelectorAll("[data-login-tab]").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    adminForm.style.display = tab.dataset.loginTab === "admin" ? "grid" : "none";
    siswaForm.style.display = tab.dataset.loginTab === "siswa" ? "grid" : "none";
  }));

  function demoLogin(role) {
    localStorage.setItem("mts-auth-role", role);
    location.href = role === "admin" ? "../dashboard/index.html" : "../siswa/index.html";
  }

  adminForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Memproses login admin...";
    if (window.mtsFirebaseAuth?.loginAdmin) {
      const result = await window.mtsFirebaseAuth.loginAdmin(adminForm["admin-email"].value, adminForm["admin-password"].value);
      if (!result.ok) return status.textContent = result.message;
    }
    demoLogin("admin");
  });

  siswaForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Memproses login siswa...";
    if (window.mtsFirebaseAuth?.loginSiswa) {
      const result = await window.mtsFirebaseAuth.loginSiswa(siswaForm["siswa-nisn"].value, siswaForm["siswa-password"].value);
      if (!result.ok) return status.textContent = result.message;
    }
    demoLogin("siswa");
  });
});
