const API_URL = "http://localhost:5000/api/goals";

async function loadGoals() {
  const res = await fetch(API_URL);
  const goals = await res.json();
  const list = document.getElementById("goalsList");
  list.innerHTML = "";

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
}

async function updateGoal(id, title, category, deadline) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, deadline }),
  });
}

async function addStep(goalId) {
  const input = document.getElementById(`step-${goalId}`);
  const text = input.value.trim();
  if (!text) return;
  await fetch(`${API_URL}/${goalId}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  input.value = "";
  loadGoals();
}

async function editStep(goalId, stepId, text) {
  await fetch(`${API_URL}/${goalId}/steps/${stepId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

async function toggleStep(goalId, stepId) {
  await fetch(`${API_URL}/${goalId}/steps/${stepId}/toggle`, { method: "PUT" });
  loadGoals();
}

async function deleteStep(goalId, stepId) {
  await fetch(`${API_URL}/${goalId}/steps/${stepId}`, { method: "DELETE" });
  loadGoals();
}

async function deleteGoal(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadGoals();
}

document.getElementById("addGoalBtn").addEventListener("click", async () => {
  const title = document.getElementById("goalTitle").value;
  const deadline = document.getElementById("goalDeadline").value;
  const category = document.getElementById("goalCategory").value;
  if (!title) return alert("Please enter a goal title!");

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, deadline, category }),
  });

  document.getElementById("goalTitle").value = "";
  document.getElementById("goalDeadline").value = "";
  document.getElementById("goalCategory").value = "";
  loadGoals();
});

function showReminder() {
  const now = new Date().toDateString();
  alert(`🕒 Today's Reminder:\nStay consistent. Review your steps and complete today's tasks!`);
}

loadGoals();
showReminder();
