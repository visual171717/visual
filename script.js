const track = document.getElementById("track");
const result = document.getElementById("result");

const CELL_WIDTH = 90; // 82px kutu + 8px gap
const TOTAL_CELLS = 150;

let spinning = false;
let audioCtx = null;
let forceRedNext = false;

function resultColor() {
  // Yeni oran: %50 / %50
  return Math.random() < 0.50 ? "green" : "red";
}

function visualColor(index) {
  // Görselde 50/50 gibi görünür
  return index % 2 === 0 ? "green" : "red";
}

function labelOf(color) {
  return color === "green" ? "YEŞİL" : "KIRMIZI";
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

function forceRed() {
  forceRedNext = true;

  const btn = document.getElementById("forceBtn");
  btn.textContent = "✅ KIRMIZI HAZIR";
  setTimeout(() => {
    btn.textContent = "🔥 KIRMIZI";
  }, 1200);
}

function playSpinSound() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const start = audioCtx.currentTime;

    for (let i = 0; i < 24; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(380 + i * 18, start + i * 0.045);

      gain.gain.setValueAtTime(0.05, start + i * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, start + i * 0.045 + 0.035);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(start + i * 0.045);
      osc.stop(start + i * 0.045 + 0.04);
    }

    const finishOsc = audioCtx.createOscillator();
    const finishGain = audioCtx.createGain();

    finishOsc.type = "sine";
    finishOsc.frequency.setValueAtTime(680, start + 5.05);
    finishOsc.frequency.exponentialRampToValueAtTime(420, start + 5.45);

    finishGain.gain.setValueAtTime(0.001, start + 5.05);
    finishGain.gain.exponentialRampToValueAtTime(0.09, start + 5.12);
    finishGain.gain.exponentialRampToValueAtTime(0.001, start + 5.45);

    finishOsc.connect(finishGain);
    finishGain.connect(audioCtx.destination);

    finishOsc.start(start + 5.05);
    finishOsc.stop(start + 5.48);
  } catch (e) {}
}

function spin() {
  if (spinning) return;

  spinning = true;
  result.textContent = "";

  playSpinSound();
  renderTrack();

  let forcedResult = resultColor();

  // Force butonuna basıldıysa sadece bu spin %100 kırmızı olur
  if (forceRedNext) {
    forcedResult = "red";
    forceRedNext = false;
  }

  const cells = Array.from(document.querySelectorAll(".cell"));

  // Hedef kutu, gerçek sonuca göre seçilir ama görsel dağılım 50/50 kalır
  let targetIndex = 118;
  if (cells[targetIndex].dataset.color !== forcedResult) {
    targetIndex += 1;
  }

  const rouletteWidth = document.querySelector(".roulette").offsetWidth;
  const centerOffset = rouletteWidth / 2 - 41;
  const randomOffsetInsideCell = Math.floor(Math.random() * 30) - 15;

  const targetX = -(targetIndex * CELL_WIDTH) + centerOffset + randomOffsetInsideCell;

  track.style.transition = "none";
  track.style.transform = "translateX(0px)";

  setTimeout(() => {
    track.style.transition = "transform 5s cubic-bezier(.08,.82,.12,1)";
    track.style.transform = `translateX(${targetX}px)`;
  }, 60);

  setTimeout(() => {
    result.textContent = forcedResult === "green" ? "YEŞİL ✅" : "KIRMIZI ❌";
    spinning = false;
  }, 5300);
}

// Space ile çevir
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") spin();

  // R tuşu ile gizli şekilde kırmızı hazırla
  if (e.code === "KeyR") forceRed();
});

renderTrack();
