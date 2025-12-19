console.log("JS Connected!");

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://eofjpxzrzjuptlkwxwgm.supabase.co";
const supabaseKey = "sb_publishable_GrTpM2UFNwxGWS3THVm2jQ_8Pz3W3VI";

const supabase = createClient(supabaseUrl , supabaseKey);

const {data: {user}} = await supabase.auth.getUser();
if(!user){
  window.location.href = "login.html";
}

let currentMonth = 0;
let currentYear = 2026;
let selectedDate = new Date(2026, 0, 1);
let plannerData = {
  entries: {},
  goals: { yearly: "", monthly: "", weekly: "" },
  habits: {},
  gratitude: {},
  visionBoard: "",
  visualization: {},
  affirmation: {},
  selfCare: {},
  discipline: { challenge: "", days: {} },
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const habits = [
  "Water",
  "Exercise",
  "Reading",
  "Meditation",
  "Sleep",
  "Healthy Eating",
  "Journaling",
  "Gratitude",
  "Prayer"
];
const selfCare = [
  "Skincare",
  "Bath",
  "Yoga",
  "Walk",
  "Healthy Meal",
  "Sleep",
  "Social",
  "Creative",
  "Digital Detox",
];

window.onload = async function () {
  await loadData();
  renderCalendar();
  renderHabits();
  renderSelfCare();
  loadGoals();
  updateDisciplineDisplay();
};

async function loadData() {
  const { data, error } = await supabase
    .from("planner")
    .select("data")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Load error:", error);
    return;
  }

  if (data) {
    plannerData = data.data;
  } else {
    await saveData();
  }
}


async function saveData() {
  const { error } = await supabase
    .from("planner")
    .upsert({
      user_id: user.id,
      data: plannerData,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Save error:", error);
  }
}


function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function showView(viewName, event) {
    document.querySelectorAll(".view").forEach(v =>
        v.classList.remove("active")
    );
    document.getElementById(viewName).classList.add("active");

    document.querySelectorAll(".nav-item").forEach(n =>
        n.classList.remove("active")
    );

    if (event) {
        event.target.closest(".nav-item").classList.add("active");
    }

    if (viewName === "daily") loadDailyData();
    if (viewName === "goals") loadGoals();

    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}


function renderCalendar() {
  const container = document.getElementById("calendarDates");
  container.innerHTML = "";

  document.getElementById(
    "monthTitle"
  ).textContent = `${months[currentMonth]} ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    container.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const btn = document.createElement("button");
    btn.className = "calendar-date";
    btn.textContent = day;

    const date = new Date(currentYear, currentMonth, day);
    const dateKey = formatDateKey(date);

    if (plannerData.entries[dateKey]) {
      btn.classList.add("has-entry");
    }

    if (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth
    ) {
      btn.classList.add("selected");
    }

    btn.onclick = () => selectDate(date);
    container.appendChild(btn);
  }
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function selectDate(date) {
  selectedDate = date;
  renderCalendar();
  showView("daily");
}

function loadDailyData() {
  const key = formatDateKey(selectedDate);
  const entry = plannerData.entries[key] || {};

  document.getElementById("dailyTitle").textContent =
    selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  document.getElementById("focus").value = entry.focus || "";
  document.getElementById("schedule").value = entry.schedule || "";
  document.getElementById("affirmation").value =
    plannerData.affirmation[key] || "";
  document.getElementById("visualization").value =
    plannerData.visualization[key] || "";
  document.getElementById("gratitude").value = plannerData.gratitude[key] || "";

  renderHabits();
  renderSelfCare();
  updateDisciplineDisplay();
}

function saveDailyData() {
  const key = formatDateKey(selectedDate);
  plannerData.entries[key] = {
    focus: document.getElementById("focus").value,
    schedule: document.getElementById("schedule").value,
  };
  plannerData.affirmation[key] = document.getElementById("affirmation").value;
  plannerData.visualization[key] =
    document.getElementById("visualization").value;
  plannerData.gratitude[key] = document.getElementById("gratitude").value;
  saveData();
  renderCalendar();
}

["focus", "schedule", "affirmation", "visualization", "gratitude"].forEach(
  (id) => {
    document.getElementById(id).addEventListener("input", saveDailyData);
  }
);

function renderHabits() {
  const container = document.getElementById("habitGrid");
  container.innerHTML = "";
  const key = formatDateKey(selectedDate);
  const dayHabits = plannerData.habits[key] || [];

  habits.forEach((habit) => {
    const btn = document.createElement("button");
    btn.className = "habit-btn";
    btn.textContent = habit;
    if (dayHabits.includes(habit)) {
      btn.classList.add("active");
    }
    btn.onclick = () => toggleHabit(habit);
    container.appendChild(btn);
  });
}

function toggleHabit(habit) {
  const key = formatDateKey(selectedDate);
  if (!plannerData.habits[key]) plannerData.habits[key] = [];

  const index = plannerData.habits[key].indexOf(habit);
  if (index > -1) {
    plannerData.habits[key].splice(index, 1);
  } else {
    plannerData.habits[key].push(habit);
  }
  saveData();
  renderHabits();
}

function renderSelfCare() {
  const container = document.getElementById("selfcareGrid");
  container.innerHTML = "";
  const key = formatDateKey(selectedDate);
  const daySelfCare = plannerData.selfCare[key] || [];

  selfCare.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "selfcare-btn";
    btn.textContent = item;
    if (daySelfCare.includes(item)) {
      btn.classList.add("active");
    }
    btn.onclick = () => toggleSelfCare(item);
    container.appendChild(btn);
  });
}

function toggleSelfCare(item) {
  const key = formatDateKey(selectedDate);
  if (!plannerData.selfCare[key]) plannerData.selfCare[key] = [];

  const index = plannerData.selfCare[key].indexOf(item);
  if (index > -1) {
    plannerData.selfCare[key].splice(index, 1);
  } else {
    plannerData.selfCare[key].push(item);
  }
  saveData();
  renderSelfCare();
}

function toggleDiscipline() {
  const key = formatDateKey(selectedDate);
  plannerData.discipline.days[key] = !plannerData.discipline.days[key];
  saveData();
  updateDisciplineDisplay();
}

function updateDisciplineDisplay() {
  const key = formatDateKey(selectedDate);
  const btn = document.getElementById("disciplineBtn");
  const completed = plannerData.discipline.days[key];

  if (completed) {
    btn.classList.add("completed");
    btn.textContent = "✓ Challenge Completed Today!";
  } else {
    btn.classList.remove("completed");
    btn.textContent = "Mark Challenge Complete";
  }

  const streak = Object.values(plannerData.discipline.days).filter(
    Boolean
  ).length;
  document.getElementById(
    "streakDisplay"
  ).textContent = `Streak: ${streak} days`;
  document.getElementById(
    "totalStreak"
  ).textContent = `${streak} Days Completed`;

  const challenge =
    plannerData.discipline.challenge || "Set your challenge in Goals & Vision";
  document.getElementById("disciplineChallenge").textContent =
    "Current Challenge: " + challenge;
}

function loadGoals() {
  document.getElementById("yearlyGoals").value = plannerData.goals.yearly || "";
  document.getElementById("monthlyGoals").value =
    plannerData.goals.monthly || "";
  document.getElementById("weeklyGoals").value = plannerData.goals.weekly || "";
  document.getElementById("visionBoard").value = plannerData.visionBoard || "";
  document.getElementById("disciplineChallengeInput").value =
    plannerData.discipline.challenge || "";
}

function saveGoals() {
  plannerData.goals.yearly = document.getElementById("yearlyGoals").value;
  plannerData.goals.monthly = document.getElementById("monthlyGoals").value;
  plannerData.goals.weekly = document.getElementById("weeklyGoals").value;
  plannerData.visionBoard = document.getElementById("visionBoard").value;
  plannerData.discipline.challenge = document.getElementById(
    "disciplineChallengeInput"
  ).value;
  saveData();
  updateDisciplineDisplay();
}

[
  "yearlyGoals",
  "monthlyGoals",
  "weeklyGoals",
  "visionBoard",
  "disciplineChallengeInput",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", saveGoals);
});


const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

function toggleSidebar() {
    sidebar.classList.toggle("show");
    overlay.classList.toggle("show");

    if (sidebar.classList.contains("show")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }
}

function closeSidebar() {
    sidebar.classList.remove("show");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
}




const toggleBtn = document.querySelector(".toggle-btn");
toggleBtn.addEventListener("click" , toggleSidebar)



window.showView = showView;
window.toggleSidebar = toggleSidebar;
window.changeMonth = changeMonth;
window.toggleDiscipline = toggleDiscipline;
