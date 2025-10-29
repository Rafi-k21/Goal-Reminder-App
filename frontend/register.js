// ✅ Always wrap code to ensure DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://goal-reminder-app.onrender.com/api/auth/register";
  const registerBtn = document.getElementById("registerBtn");

  if (!registerBtn) {
    console.error("⚠️ Register button not found in DOM");
    return;
  }

  registerBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      return alert("Please fill in all fields");
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Account created successfully!");
        // Optionally store token if backend returns it
        if (data.token) localStorage.setItem("token", data.token);
        window.location.href = "login.html";
      } else {
        alert(data.message || "❌ Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("⚠️ Network or server issue. Try again later.");
    }
  });
});
