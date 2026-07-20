const form = document.querySelector("#profileForm");
const skillsInput = document.querySelector("#skills");
const interestsInput = document.querySelector("#interests");
const goalsInput = document.querySelector("#goals");
const ideasEl = document.querySelector(".ideas");
const titleEl = document.querySelector("#constellationTitle");
const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
const exportButton = document.querySelector("#exportBrief");
const briefDialog = document.querySelector("#briefDialog");
const briefOutput = document.querySelector("#briefOutput");
const randomizeButton = document.querySelector("#randomize");
const clearButton = document.querySelector("#clear");

const samples = [
  {
    skills: "frontend, storytelling, basic data analysis",
    interests: "music, focus tools, personal knowledge systems",
    goals: "portfolio, internship, daily creative practice"
  },
  {
    skills: "Python, Excel, visual design, writing",
    interests: "travel, language learning, tiny automations",
    goals: "GitHub project, useful demo, beginner-friendly docs"
  },
  {
    skills: "React, CSS, product thinking",
    interests: "wellness, habit tracking, mood journaling",
    goals: "polished UI, open source, weekend build"
  }
];

const templates = [
  {
    name: "Tiny Atlas",
    pitch: "A visual map that connects your interests into a browsable personal knowledge base.",
    stack: "HTML, CSS, JavaScript"
  },
  {
    name: "Focus Mixer",
    pitch: "A playful dashboard that combines skills and moods into custom focus sessions.",
    stack: "Web Audio API, localStorage, Canvas"
  },
  {
    name: "Portfolio Quest Log",
    pitch: "A gamified tracker that turns learning goals into quests, milestones, and shareable progress cards.",
    stack: "JavaScript, CSS Grid, Markdown export"
  },
  {
    name: "Skill Recipe Generator",
    pitch: "A generator that mixes your skills and interests into small weekend projects with build steps.",
    stack: "Vanilla JS, local templates"
  },
  {
    name: "Micro Case Study Lab",
    pitch: "A simple tool for turning everyday observations into polished portfolio case studies.",
    stack: "HTML forms, localStorage, Markdown"
  }
];

let state = {
  profile: { skills: [], interests: [], goals: [] },
  ideas: [],
  activeIndex: 0,
  stars: []
};

function splitTags(value) {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function pick(list, index) {
  return list[index % Math.max(list.length, 1)] || "creative work";
}

function makeIdeas(profile) {
  const seed = [...profile.skills, ...profile.interests, ...profile.goals].join("|").length;
  return templates.slice(0, 5).map((template, index) => {
    const skill = pick(profile.skills, index + seed);
    const interest = pick(profile.interests, index + seed * 2);
    const goal = pick(profile.goals, index + seed * 3);

    return {
      ...template,
      title: `${template.name}: ${interest}`,
      reason: `Uses ${skill} to explore ${interest}, while supporting your goal of ${goal}.`,
      color: ["#68c3a3", "#f26b5e", "#f2b84b", "#5577d9", "#9a70d6"][index]
    };
  });
}

function saveProfile() {
  localStorage.setItem("spark-constellation-profile", JSON.stringify({
    skills: skillsInput.value,
    interests: interestsInput.value,
    goals: goalsInput.value
  }));
}

function loadProfile() {
  const saved = localStorage.getItem("spark-constellation-profile");
  if (!saved) return;
  const profile = JSON.parse(saved);
  skillsInput.value = profile.skills || "";
  interestsInput.value = profile.interests || "";
  goalsInput.value = profile.goals || "";
}

function renderIdeas() {
  if (!state.ideas.length) return;
  ideasEl.innerHTML = "";

  state.ideas.slice(0, 3).forEach((idea, index) => {
    const card = document.createElement("article");
    card.className = `idea-card ${index === state.activeIndex ? "is-active" : ""}`;
    card.innerHTML = `
      <h3>${idea.title}</h3>
      <p>${idea.pitch}</p>
      <p><strong>Why:</strong> ${idea.reason}</p>
    `;
    card.addEventListener("click", () => setActive(index));
    ideasEl.appendChild(card);
  });
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  buildStars();
}

function buildStars() {
  const rect = canvas.getBoundingClientRect();
  const labels = [...state.profile.skills, ...state.profile.interests, ...state.profile.goals];
  state.stars = labels.map((label, index) => ({
    label,
    x: 70 + ((index * 137) % Math.max(rect.width - 140, 120)),
    y: 56 + ((index * 91) % Math.max(rect.height - 112, 120)),
    radius: 5 + (index % 3),
    phase: index * 0.7,
    color: index % 3 === 0 ? "#68c3a3" : index % 3 === 1 ? "#f2b84b" : "#f26b5e"
  }));
}

function draw(time = 0) {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "#10171f";
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i < state.stars.length; i += 1) {
    const a = state.stars[i];
    const b = state.stars[(i + 1) % state.stars.length];
    if (!b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  state.stars.forEach((star, index) => {
    const pulse = Math.sin(time / 500 + star.phase) * 1.8;
    ctx.beginPath();
    ctx.fillStyle = star.color;
    ctx.shadowColor = star.color;
    ctx.shadowBlur = index === state.activeIndex ? 24 : 12;
    ctx.arc(star.x, star.y, star.radius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText(star.label.slice(0, 22), star.x + 12, star.y + 4);
  });

  requestAnimationFrame(draw);
}

function setActive(index) {
  state.activeIndex = index;
  titleEl.textContent = state.ideas[index]?.title || "Your constellation is waiting";
  renderIdeas();
}

function generate() {
  const profile = {
    skills: splitTags(skillsInput.value),
    interests: splitTags(interestsInput.value),
    goals: splitTags(goalsInput.value)
  };

  state.profile = profile;
  state.ideas = makeIdeas(profile);
  state.activeIndex = 0;
  saveProfile();
  buildStars();
  setActive(0);
}

function exportBrief() {
  const idea = state.ideas[state.activeIndex];
  if (!idea) return;

  briefOutput.value = `# ${idea.title}

## Concept
${idea.pitch}

## Why this fits me
${idea.reason}

## Background Inputs
- Skills: ${state.profile.skills.join(", ") || "Not provided"}
- Interests: ${state.profile.interests.join(", ") || "Not provided"}
- Goals: ${state.profile.goals.join(", ") || "Not provided"}

## Suggested Stack
${idea.stack}

## MVP Checklist
- Build the core interaction
- Add local save
- Write a concise README
- Add screenshots
- Publish on GitHub Pages
`;

  briefDialog.showModal();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});

randomizeButton.addEventListener("click", () => {
  const sample = samples[Math.floor(Math.random() * samples.length)];
  skillsInput.value = sample.skills;
  interestsInput.value = sample.interests;
  goalsInput.value = sample.goals;
  generate();
});

clearButton.addEventListener("click", () => {
  skillsInput.value = "";
  interestsInput.value = "";
  goalsInput.value = "";
  localStorage.removeItem("spark-constellation-profile");
});

canvas.addEventListener("click", (event) => {
  if (!state.ideas.length) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const closest = state.stars.reduce((best, star, index) => {
    const distance = Math.hypot(star.x - x, star.y - y);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Infinity });
  setActive(closest.index % Math.min(state.ideas.length, 3));
});

exportButton.addEventListener("click", exportBrief);
window.addEventListener("resize", resizeCanvas);

loadProfile();
resizeCanvas();
if (skillsInput.value || interestsInput.value || goalsInput.value) {
  generate();
}
requestAnimationFrame(draw);
