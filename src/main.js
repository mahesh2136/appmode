import './style.css';

let is24Hour = localStorage.getItem('flip_clock_24h') === 'true';
let wakeLock = null;
let hideControlsTimeout = null;

const formatBtn = document.getElementById('formatToggle');
const fsBtn = document.getElementById('fullscreenToggle');
const controls = document.getElementById('controls');

function updateFormatButton() {
  formatBtn.textContent = is24Hour ? '24H' : '12H';
}
updateFormatButton();

formatBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  is24Hour = !is24Hour;
  localStorage.setItem('flip_clock_24h', is24Hour);
  updateFormatButton();
  updateClock(true);
});

fsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

function showControls() {
  controls.classList.add('visible');
  clearTimeout(hideControlsTimeout);
  hideControlsTimeout = setTimeout(() => {
    controls.classList.remove('visible');
  }, 4000);
}

document.addEventListener('click', showControls);
document.addEventListener('touchstart', showControls, { passive: true });

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (err) {}
}

document.addEventListener('visibilitychange', () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});
requestWakeLock();

function flipDigit(elementId, newDigit, force = false) {
  const card = document.getElementById(elementId);
  const topHalf = card.querySelector('.half.top span');
  const bottomHalf = card.querySelector('.half.bottom span');
  const currentDigit = topHalf.textContent;

  if (currentDigit === newDigit && !force) return;

  if (force) {
    topHalf.textContent = newDigit;
    bottomHalf.textContent = newDigit;
    return;
  }

  const topFlip = document.createElement('div');
  topFlip.className = 'flap-leaf top-flip';
  topFlip.innerHTML = `<span>${currentDigit}</span>`;

  const bottomFlip = document.createElement('div');
  bottomFlip.className = 'flap-leaf bottom-flip';
  bottomFlip.innerHTML = `<span>${newDigit}</span>`;

  topHalf.textContent = newDigit;

  card.appendChild(topFlip);
  card.appendChild(bottomFlip);

  topFlip.addEventListener('animationend', () => topFlip.remove());
  bottomFlip.addEventListener('animationend', () => {
    bottomHalf.textContent = newDigit;
    bottomFlip.remove();
  });
}

function updateClock(force = false) {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();

  if (!is24Hour) {
    hours = hours % 12 || 12;
  }

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');

  flipDigit('h1', hStr[0], force);
  flipDigit('h2', hStr[1], force);
  flipDigit('m1', mStr[0], force);
  flipDigit('m2', mStr[1], force);
}

updateClock(true);
setInterval(updateClock, 1000);
