// ✅ Auto-detect environment (local or Render)
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/auth"
    : "https://goal-reminder-app.onrender.com/api/auth";

// ✅ Wait until DOM is loaded before accessing elements
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const guestBtn = document.getElementById("guestBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!loginBtn || !emailInput || !passwordInput) {
    console.error("⚠️ Login elements not found in DOM");
    return;
  }

  // 🔐 Login Handler
  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Try to parse JSON safely
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (res.ok) {
        // ✅ Save user & token
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert(`Welcome back, ${data.user.name || "user"}!`);
        window.location.href = "index.html";
      } else {
        alert(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again later.");
    }
  });

  // 👤 Guest Mode
  if (guestBtn) {
    guestBtn.addEventListener("click", () => {
      sessionStorage.setItem("guest", "true");
      window.location.href = "index.html";
    });
  }
});
