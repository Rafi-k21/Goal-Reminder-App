// ✅ Backend API base URL (your Render backend)
const API_URL = "https://goal-reminder-app.onrender.com/api";

// ====== AUTH HANDLING ======
let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));

// Redirect if not logged in (except guest mode)
if (!token && !sessionStorage.getItem("guest")) {
  window.location.href = "login.html";
}

// Handle Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("guest");
  window.location.href = "login.html";
});

// Show user info
const userInfo = document.getElementById("userInfo");
if (sessionStorage.getItem("guest")) {
  userInfo.innerText = "👤 Guest Mode (Limited Access)";
} else if (user) {
  userInfo.innerText = `👋 Hello, ${user.name}`;
}

// ====== GOALS HANDLING ======
async function loadGoals() {
  const list = document.getElementById("goalsList");
  list.innerHTML = "<p>Loading goals...</p>";

  try {
    const res = await fetch(`${API_URL}/goals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const goals = await res.json();

    list.innerHTML = "";

    if (!goals.length) {
      list.innerHTML = "<p>No goals yet. Add your first one!</p>";
      return;
    }

    goals.forEach((goal) => {
      const total = goal.steps.length;
      const done = goal.steps.filter((s) => s.done).length;
      const progress = total ? Math.round((done / total) * 100) : 0;

      const div = document.createElement("div");
      div.className = "goal-card";
      div.innerHTML = `
        <h3 contenteditable="true" onblur="updateGoal('${goal._id}', this.innerText, '${goal.category}', '${goal.deadline}')">${goal.title}</h3>
        <small>Deadline: ${goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "None"} | ${goal.category}</small>

        <div class="progress-container">
          <div class="progress-bar" style="width: ${progress}%;"></div>
        </div>
        <small>${progress}% Complete</small>

        <div class="steps">
          ${(goal.steps || [])
            .map(
              (s) => `
            <div class="step ${s.done ? "done" : ""}">
              <span contenteditable="true" onblur="editStep('${goal._id}', '${s._id}', this.innerText)" onclick="toggleStep('${goal._id}', '${s._id}')">${s.text}</span>
              <button onclick="deleteStep('${goal._id}', '${s._id}')">✖</button>
            </div>`
            )
            .join("")}
        </div>
        <div class="add-step">
          <input type="text" id="step-${goal._id}" placeholder="Add step..." />
          <button onclick="addStep('${goal._id}')">+</button>
        </div>
        <button class="delete-goal" onclick="deleteGoal('${goal._id}')">Delete Goal</button>
      `;
      list.appendChild(div);
    });
  } catch (error) {
    list.innerHTML = "<p>⚠️ Failed to load goals. Please log in again.</p>";
  }
}

// ====== CRUD FUNCTIONS ======
async function updateGoal(id, title, category, deadline) {
  await fetch(`${API_URL}/goals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, category, deadline }),
  });
}

async function addStep(goalId) {
  const input = document.getElementById(`step-${goalId}`);
  const text = input.value.trim();
  if (!text) return;

  await fetch(`${API_URL}/goals/${goalId}/steps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });
  input.value = "";
  loadGoals();
}

async function editStep(goalId, stepId, text) {
  await fetch(`${API_URL}/goals/${goalId}/steps/${stepId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });
}

async function toggleStep(goalId, stepId) {
  await fetch(`${API_URL}/goals/${goalId}/steps/${stepId}/toggle`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadGoals();
}

async function deleteStep(goalId, stepId) {
  await fetch(`${API_URL}/goals/${goalId}/steps/${stepId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadGoals();
}

async function deleteGoal(id) {
  await fetch(`${API_URL}/goals/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadGoals();
}

// ====== ADD GOAL ======
document.getElementById("addGoalBtn").addEventListener("click", async () => {
  const title = document.getElementById("goalTitle").value;
  const deadline = document.getElementById("goalDeadline").value;
  const category = document.getElementById("goalCategory").value;

  if (!title) return alert("Please enter a goal title!");

  if (sessionStorage.getItem("guest")) {
    return alert("Guest mode is limited — create an account to save your goals.");
  }

  await fetch(`${API_URL}/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, deadline, category }),
  });

  document.getElementById("goalTitle").value = "";
  document.getElementById("goalDeadline").value = "";
  document.getElementById("goalCategory").value = "";
  loadGoals();
});

// ====== DAILY REMINDER ======
function showReminder() {
  alert("🕒 Stay focused today! Review your goals and take one more step toward success.");
}

// ====== INIT ======
loadGoals();
showReminder();
