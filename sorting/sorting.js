// State
let array = [];
let history = [];
let currentStep = 0;
let playInterval = null;

// UI refs
const arrayType = document.getElementById('array-type');
const customSize = document.getElementById('custom-size');
const customInput = document.getElementById('custom-array-input');
const orderType = document.getElementById('order-type');
const speedInput = document.getElementById('speed-input');
const genBtn = document.getElementById('generate-btn');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const barsContainer = document.getElementById('bars');
const stepsLog = document.getElementById('steps-log');
const algos = document.getElementsByName('algo');

// Toggle custom inputs
arrayType.addEventListener('change', () => {
    const show = arrayType.value === 'custom';
    customSize.style.display = show ? 'inline-block' : 'none';
    customInput.style.display = show ? 'inline-block' : 'none';
});

// Generate array
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
const getAlgo = () => Array.from(algos).find(r => r.checked).value;
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

// Record sorting steps with descriptions and colors
function record() {
    const arr = array.slice();
    const asc = orderType.value === 'asc';
    const cmp = (a, b) => asc ? a < b : a > b;
    const algo = getAlgo();
    history.push({ arr: arr.slice(), colors: Array(arr.length).fill(null), desc: 'Initial array' });

    const pushStep = (i, j, swapped = false) => {
        const desc = swapped
            ? `Swapped index ${i} (value ${arr[j]}) and ${j} (value ${arr[i]})`
            : `Compared index ${i} (value ${arr[i]}) and ${j} (value ${arr[j]})`;
        const colors = Array(arr.length).fill('#ccc');
        colors[i] = swapped ? '#e74c3c' : '#f1c40f';
        colors[j] = swapped ? '#e74c3c' : '#f1c40f';
        history.push({ arr: arr.slice(), colors, desc });
    };

    // Bubble Sort
    if (algo === 'bubble') {
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - 1 - i; j++) {
                pushStep(j, j + 1);
                if (!cmp(arr[j], arr[j + 1])) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    pushStep(j, j + 1, true);
                }
            }
        }
    }

    // Selection Sort
    if (algo === 'selection') {
        for (let i = 0; i < arr.length; i++) {
            let idx = i;
            for (let j = i + 1; j < arr.length; j++) {
                pushStep(idx, j);
                if (cmp(arr[j], arr[idx])) idx = j;
            }
            if (idx !== i) {
                [arr[i], arr[idx]] = [arr[idx], arr[i]];
                pushStep(i, idx, true);
            }
        }
    }

    // Insertion Sort
    if (algo === 'insertion') {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;
            while (j >= 0 && !cmp(arr[j], key)) {
                pushStep(j, j + 1);
                arr[j + 1] = arr[j];
                pushStep(j, j + 1, true);
                j--;
            }
            arr[j + 1] = key;
            history.push({ arr: arr.slice(), colors: Array(arr.length).fill('#2ecc71'), desc: `Inserted value ${key} at position ${j + 1}` });
        }
    }

    // Merge Sort
    if (algo === 'merge') {
        const mergeFun = (l, m, r) => {
            const L = arr.slice(l, m + 1);
            const R = arr.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;
            while (i < L.length && j < R.length) {
                pushStep(l + i, m + 1 + j);
                if (cmp(L[i], R[j])) {
                    arr[k++] = L[i++];
                } else {
                    arr[k++] = R[j++];
                }
                history.push({ arr: arr.slice(), colors: Array(arr.length).fill('#2ecc71'), desc: `Merged at index ${k - 1}` });
            }
            while (i < L.length) {
                arr[k++] = L[i++];
                history.push({ arr: arr.slice(), colors: Array(arr.length).fill('#2ecc71'), desc: `Merged leftover L at index ${k - 1}` });
            }
            while (j < R.length) {
                arr[k++] = R[j++];
                history.push({ arr: arr.slice(), colors: Array(arr.length).fill('#2ecc71'), desc: `Merged leftover R at index ${k - 1}` });
            }
        };
        const ms = (l, r) => {
            if (l < r) {
                const m = Math.floor((l + r) / 2);
                ms(l, m);
                ms(m + 1, r);
                mergeFun(l, m, r);
            }
        };
        ms(0, arr.length - 1);
    }

    // Quick Sort
    if (algo === 'quick') {
        const qs = (l, r) => {
            if (l < r) {
                let pi = l;
                const pivot = arr[r];
                for (let j = l; j < r; j++) {
                    pushStep(j, r);
                    if (cmp(arr[j], pivot)) {
                        [arr[pi], arr[j]] = [arr[j], arr[pi]];
                        pushStep(pi, j, true);
                        pi++;
                    }
                }
                [arr[pi], arr[r]] = [arr[r], arr[pi]];
                pushStep(pi, r, true);
                qs(l, pi - 1);
                qs(pi + 1, r);
            }
        };
        qs(0, arr.length - 1);
    }
}

// Play animation
function playAnimation() {
    if (!history.length) {
        record();
    }
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    backBtn.disabled = false;
    forwardBtn.disabled = false;
    stepsLog.innerHTML = '';
    playInterval = setInterval(() => {
        if (currentStep >= history.length) {
            clearInterval(playInterval);
            return;
        }
        const step = history[currentStep++];
        renderBars(step.arr, step.colors);
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
    renderBars(step.arr, step.colors);
    rebuildLog();
}

function stepForward() {
    if (currentStep >= history.length) return;
    const step = history[currentStep++];
    renderBars(step.arr, step.colors);
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
