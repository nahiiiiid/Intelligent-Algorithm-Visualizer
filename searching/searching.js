// State
let array = [];
let target = null;
let history = [];
let currentStep = 0;
let playInterval = null;

// UI refs
const arrayType = document.getElementById('array-type');
const customSize = document.getElementById('custom-size');
const customInput = document.getElementById('custom-array-input');
const speedInput = document.getElementById('speed-input');
const genBtn = document.getElementById('generate-btn');
const targetInput = document.getElementById('target-input');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const barsContainer = document.getElementById('bars');
const stepsLog = document.getElementById('steps-log');
const searchRadios = document.getElementsByName('search-type');

// Toggle custom inputs
arrayType.addEventListener('change', () => {
  const show = arrayType.value === 'custom';
  customSize.style.display = show ? 'inline-block' : 'none';
  customInput.style.display = show ? 'inline-block' : 'none';
});

// Generate Array
genBtn.addEventListener('click', () => {
  if (arrayType.value === 'custom') {
    const size = parseInt(customSize.value);
    const vals = customInput.value.split(',').map(n => parseInt(n.trim()));
    if (isNaN(size) || vals.length !== size || vals.some(isNaN)) {
      return alert('Invalid custom array.');
    }
    array = vals;
  } else {
    array = Array.from({ length: 20 }, () => Math.floor(Math.random() * 250) + 20);
  }
  renderBars(array);
  reset();
  playBtn.disabled = false;
});

// Helpers
const getSearchType = () => Array.from(searchRadios).find(r => r.checked).value;
const renderBars = (heights, colors = []) => {
  barsContainer.innerHTML = '';
  heights.forEach((h, i) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${h}px`;
    bar.style.background = colors[i] || 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    const lbl = document.createElement('span');
    lbl.innerText = h;
    bar.appendChild(lbl);
    barsContainer.appendChild(bar);
  });
};

function reset() {
  clearInterval(playInterval);
  history = [];
  currentStep = 0;
  stepsLog.innerHTML = '';
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  backBtn.disabled = true;
  forwardBtn.disabled = true;
}

// Record steps
function record() {
  const arr = array.slice();
  target = parseInt(targetInput.value);
  if (isNaN(target)) return alert('Enter valid target.');
  const type = getSearchType();
  let left = 0, right = arr.length - 1;
  history.push({ heights: arr.slice(), colors: Array(arr.length).fill(null), desc: 'Start searching' });

  if (type === 'linear') {
    for (let i = 0; i < arr.length; i++) {
      history.push({
        heights: arr.slice(),
        colors: Array(arr.length).fill('#ccc').map((c, idx) => idx === i ? '#f1c40f' : c),
        desc: `Check index ${i}, value ${arr[i]}`
      });
      if (arr[i] === target) {
        history.push({
          heights: arr.slice(),
          colors: Array(arr.length).fill('#ccc').map((c, idx) => idx === i ? '#2ecc71' : c),
          desc: `Found target ${target} at index ${i}`
        });
        return;
      }
    }
    history.push({ heights: arr.slice(), colors: Array(arr.length).fill('#e74c3c'), desc: 'Target not found' });
  } else {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      history.push({
        heights: arr.slice(),
        colors: Array(arr.length).fill('#ccc').map((c, idx) => idx === mid ? '#f1c40f' : c),
        desc: `Check middle index ${mid}, value ${arr[mid]}`
      });
      if (arr[mid] === target) {
        history.push({
          heights: arr.slice(),
          colors: Array(arr.length).fill('#ccc').map((c, idx) => idx === mid ? '#2ecc71' : c),
          desc: `Found target ${target} at index ${mid}`
        });
        return;
      }
      if (arr[mid] < target) {
        left = mid + 1;
        history.push({ heights: arr.slice(), colors: Array(arr.length).fill('#3498db'), desc: `Value ${arr[mid]} < ${target}, move right` });
      } else {
        right = mid - 1;
        history.push({ heights: arr.slice(), colors: Array(arr.length).fill('#3498db'), desc: `Value ${arr[mid]} > ${target}, move left` });
      }
    }
    history.push({ heights: arr.slice(), colors: Array(arr.length).fill('#e74c3c'), desc: 'Target not found' });
  }
}

// Play animation
function playAnimation() {
  if (!history.length) record();
  playBtn.disabled = true;
  pauseBtn.disabled = false;
  backBtn.disabled = false;
  forwardBtn.disabled = false;
  stepsLog.innerHTML = '';
  playInterval = setInterval(() => {
    if (currentStep >= history.length) return clearInterval(playInterval);
    const step = history[currentStep++];
    renderBars(step.heights, step.colors);
    const p = document.createElement('p');
    p.innerText = `${currentStep}. ${step.desc}`;
    stepsLog.appendChild(p);
  }, parseInt(speedInput.value));
}

function pauseAnimation() {
  clearInterval(playInterval);
  playBtn.disabled = false;
  pauseBtn.disabled = true;
}

function stepBackward() {
  if (currentStep <= 1) return;
  currentStep--;
  const step = history[currentStep - 1];
  renderBars(step.heights, step.colors);
  rebuildLog();
}

function stepForward() {
  if (currentStep >= history.length) return;
  const step = history[currentStep++];
  renderBars(step.heights, step.colors);
  rebuildLog();
}

function rebuildLog() {
  stepsLog.innerHTML = '';
  for (let i = 0; i < currentStep; i++) {
    const p = document.createElement('p');
    p.innerText = `${i + 1}. ${history[i].desc}`;
    stepsLog.appendChild(p);
  }
}

// Event listeners
playBtn.addEventListener('click', playAnimation);
pauseBtn.addEventListener('click', pauseAnimation);
backBtn.addEventListener('click', stepBackward);
forwardBtn.addEventListener('click', stepForward);

window.onload = () => {
  renderBars([]);
};
