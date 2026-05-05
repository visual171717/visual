// Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Senin config
const firebaseConfig = {
  apiKey: "AIzaSyAX1U1lnSR_n2Ixo9lfO0HKgPK98aGkrmw",
  authDomain: "visual171717-1128c.firebaseapp.com",
  databaseURL: "https://visual171717-1128c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "visual171717-1128c",
  storageBucket: "visual171717-1128c.firebasestorage.app",
  messagingSenderId: "340000351729",
  appId: "1:340000351729:web:f9e67f04bb646572341050"
};

// Başlat
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const track = document.getElementById("track");
const result = document.getElementById("result");

const CELL_WIDTH = 90;
const TOTAL_CELLS = 150;

let spinning = false;
let forceRedNext = false;

// 🔥 Firebase dinleme (HERKES AYNI SONUCU GÖRÜR)
onValue(ref(db, "spin"), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  playSpin(data.result);
});

// Normal oran (50/50)
function resultColor() {
  return Math.random() < 0.5 ? "green" : "red";
}

// Görsel 50/50
function visualColor(i) {
  return i % 2 === 0 ? "green" : "red";
}

function labelOf(c) {
  return c === "green" ? "YEŞİL" : "KIRMIZI";
}

function renderTrack() {
  track.innerHTML = "";
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const color = visualColor(i);
    const div = document.createElement("div");
    div.className = "cell " + color;
    div.dataset.color = color;
    div.textContent = labelOf(color);
    track.appendChild(div);
  }
}

function spin() {
  if (spinning) return;

  let resultColorValue = resultColor();

  if (forceRedNext) {
    resultColorValue = "red";
    forceRedNext = false;
  }

  // 🔥 Firebase'e yaz → herkes görür
  set(ref(db, "spin"), {
    result: resultColorValue,
    time: Date.now()
  });
}

function playSpin(finalResult) {
  spinning = true;
  result.textContent = "";
  renderTrack();

  const cells = Array.from(document.querySelectorAll(".cell"));

  let targetIndex = 118;
  if (cells[targetIndex].dataset.color !== finalResult) {
    targetIndex += 1;
  }

  const rouletteWidth = document.querySelector(".roulette").offsetWidth;
  const centerOffset = rouletteWidth / 2 - 41;

  const randomOffset = Math.floor(Math.random() * 30) - 15;
  const targetX = -(targetIndex * CELL_WIDTH) + centerOffset + randomOffset;

  track.style.transition = "none";
  track.style.transform = "translateX(0px)";

  setTimeout(() => {
    track.style.transition = "transform 5s cubic-bezier(.08,.82,.12,1)";
    track.style.transform = `translateX(${targetX}px)`;
  }, 60);

  setTimeout(() => {
    result.textContent = finalResult === "green" ? "YEŞİL ✅" : "KIRMIZI ❌";
    spinning = false;
  }, 5300);
}

function forceRed() {
  forceRedNext = true;
}

window.spin = spin;
window.forceRed = forceRed;

renderTrack();
