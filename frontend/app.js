// ✅ Backend API base URL (Render backend)
const API_URL = "https://goal-reminder-app.onrender.com/api";

// ====== AUTH HANDLING ======
let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));
let isGuest = sessionStorage.getItem("guest");

// Redirect if not logged in (except guest mode)
if (!token && !isGuest) {
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
if (isGuest) {
  userInfo.innerText = "👤 Guest Mode ";
} else if (user) {
  userInfo.innerText = `👋 Hello, ${user.name}`;
}

// ====== LOCAL STORAGE FOR GUEST ======
function getGuestGoals() {
  return JSON.parse(localStorage.getItem("guestGoals") || "[]");
}
function saveGuestGoals(goals) {
  localStorage.setItem("guestGoals", JSON.stringify(goals));
}

// ====== GOALS HANDLING ======
async function loadGoals() {
  const list = document.getElementById("goalsList");
  list.innerHTML = "<p>Loading goals...</p>";

  try {
    let goals = [];

    if (isGuest) {
      goals = getGuestGoals();
    } else {
      const res = await fetch(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      goals = await res.json();
    }

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
    console.error("Error loading goals:", error);
    list.innerHTML = "<p>⚠️ Failed to load goals.</p>";
  }
}

// ====== CRUD FUNCTIONS ======
async function updateGoal(id, title, category, deadline) {
  if (isGuest) {
    const goals = getGuestGoals();
    const goal = goals.find((g) => g._id === id);
    if (goal) {
      goal.title = title;
      goal.category = category;
      goal.deadline = deadline;
      saveGuestGoals(goals);
    }
    loadGoals();
    return;
  }

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

  if (isGuest) {
    const goals = getGuestGoals();
    const goal = goals.find((g) => g._id === goalId);
    if (goal) {
      goal.steps.push({ _id: Date.now().toString(), text, done: false });
      saveGuestGoals(goals);
    }
    input.value = "";
    loadGoals();
    return;
  }

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
  if (isGuest) {
    const goals = getGuestGoals();
    const goal = goals.find((g) => g._id === goalId);
    if (goal) {
      const step = goal.steps.find((s) => s._id === stepId);
      if (step) step.text = text;
      saveGuestGoals(goals);
    }
    loadGoals();
    return;
  }

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
  if (isGuest) {
    const goals = getGuestGoals();
    const goal = goals.find((g) => g._id === goalId);
    if (goal) {
      const step = goal.steps.find((s) => s._id === stepId);
      if (step) step.done = !step.done;
      saveGuestGoals(goals);
    }
    loadGoals();
    return;
  }

  await fetch(`${API_URL}/goals/${goalId}/steps/${stepId}/toggle`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadGoals();
}

async function deleteStep(goalId, stepId) {
  if (isGuest) {
    const goals = getGuestGoals();
    const goal = goals.find((g) => g._id === goalId);
    if (goal) {
      goal.steps = goal.steps.filter((s) => s._id !== stepId);
      saveGuestGoals(goals);
    }
    loadGoals();
    return;
  }

  await fetch(`${API_URL}/goals/${goalId}/steps/${stepId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadGoals();
}

async function deleteGoal(id) {
  if (isGuest) {
    const goals = getGuestGoals().filter((g) => g._id !== id);
    saveGuestGoals(goals);
    loadGoals();
    return;
  }

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

  if (isGuest) {
    const goals = getGuestGoals();
    const newGoal = {
      _id: Date.now().toString(),
      title,
      deadline,
      category,
      steps: [],
    };
    goals.push(newGoal);
    saveGuestGoals(goals);
    loadGoals();
    document.getElementById("goalTitle").value = "";
    document.getElementById("goalDeadline").value = "";
    document.getElementById("goalCategory").value = "";
    return;
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
