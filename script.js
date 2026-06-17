/* =============================================
   SplitRent — Rent Calculator Script
   ============================================= */

// ── DOM References ──────────────────────────────────────────
const form        = document.getElementById('rentForm');
const calcBtn     = document.getElementById('calcBtn');
const resetBtn    = document.getElementById('resetBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const resultsCard = document.getElementById('resultsCard');
const historyCard = document.getElementById('historyCard');
const historyList = document.getElementById('historyList');
const historyEmpty= document.getElementById('historyEmpty');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const inputs = {
  rent:    document.getElementById('rent'),
  food:    document.getElementById('food'),
  units:   document.getElementById('units'),
  rate:    document.getElementById('rate'),
  persons: document.getElementById('persons'),
};

const errors = {
  rent:    document.getElementById('rentError'),
  food:    document.getElementById('foodError'),
  units:   document.getElementById('unitsError'),
  rate:    document.getElementById('rateError'),
  persons: document.getElementById('personsError'),
};

const results = {
  elec:      document.getElementById('elecResult'),
  total:     document.getElementById('totalResult'),
  perPerson: document.getElementById('perPersonResult'),
};

const rentSeg = document.getElementById('rentSeg');
const foodSeg = document.getElementById('foodSeg');
const elecSeg = document.getElementById('elecSeg');
const incBtn  = document.getElementById('incBtn');
const decBtn  = document.getElementById('decBtn');

// ── History Storage Key ──────────────────────────────────────
const HISTORY_KEY = 'splitrent-history';
const MAX_HISTORY = 20;

// ── Theme Toggle ────────────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem('splitrent-theme') || 'dark';
  applyTheme(saved);
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('splitrent-theme', next);
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    themeIcon.className = 'fa-solid fa-sun';
    themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    themeIcon.className = 'fa-solid fa-moon';
    themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
}

// ── Persons Stepper ─────────────────────────────────────────
incBtn.addEventListener('click', () => {
  const v = parseInt(inputs.persons.value) || 0;
  inputs.persons.value = v + 1;
  clearError('persons');
});

decBtn.addEventListener('click', () => {
  const v = parseInt(inputs.persons.value) || 2;
  if (v > 1) inputs.persons.value = v - 1;
});

// ── Real-time Validation on Blur ────────────────────────────
Object.keys(inputs).forEach(key => {
  inputs[key].addEventListener('blur', () => validateField(key));
  inputs[key].addEventListener('input', () => {
    if (inputs[key].classList.contains('input-error')) validateField(key);
  });
});

// ── Validation ───────────────────────────────────────────────
const validationRules = {
  rent: {
    rules: [
      { test: v => v !== '',         msg: 'Rent is required.' },
      { test: v => parseFloat(v) >= 0, msg: 'Rent cannot be negative.' },
    ],
  },
  food: {
    rules: [
      { test: v => v !== '',         msg: 'Food expenses are required.' },
      { test: v => parseFloat(v) >= 0, msg: 'Food expenses cannot be negative.' },
    ],
  },
  units: {
    rules: [
      { test: v => v !== '',         msg: 'Electricity units are required.' },
      { test: v => parseFloat(v) >= 0, msg: 'Units cannot be negative.' },
    ],
  },
  rate: {
    rules: [
      { test: v => v !== '',         msg: 'Charge per unit is required.' },
      { test: v => parseFloat(v) > 0, msg: 'Charge per unit must be greater than 0.' },
    ],
  },
  persons: {
    rules: [
      { test: v => v !== '',                       msg: 'Number of persons is required.' },
      { test: v => parseInt(v) >= 1,               msg: 'At least 1 person is required.' },
      { test: v => Number.isInteger(parseFloat(v)), msg: 'Must be a whole number.' },
    ],
  },
};

function validateField(key) {
  const val = inputs[key].value.trim();
  for (const r of validationRules[key].rules) {
    if (!r.test(val)) { showError(key, r.msg); return false; }
  }
  clearError(key);
  return true;
}

function validateAll() {
  let valid = true;
  Object.keys(inputs).forEach(key => { if (!validateField(key)) valid = false; });
  return valid;
}

function showError(key, msg) {
  errors[key].textContent = msg;
  errors[key].classList.add('visible');
  inputs[key].classList.add('input-error');
}

function clearError(key) {
  errors[key].textContent = '';
  errors[key].classList.remove('visible');
  inputs[key].classList.remove('input-error');
}

function clearAllErrors() {
  Object.keys(inputs).forEach(key => clearError(key));
}

// ── Currency Formatter ───────────────────────────────────────
function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ── Date Formatter ───────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// ── Calculate ────────────────────────────────────────────────
form.addEventListener('submit', e => { e.preventDefault(); calculate(); });

function calculate() {
  if (!validateAll()) { shakeCard(); return; }

  const rent    = parseFloat(inputs.rent.value);
  const food    = parseFloat(inputs.food.value);
  const units   = parseFloat(inputs.units.value);
  const rate    = parseFloat(inputs.rate.value);
  const persons = parseInt(inputs.persons.value);

  const totalElec = units * rate;
  const totalExp  = rent + food + totalElec;
  const perPerson = totalExp / persons;

  // Show result tiles
  results.elec.textContent      = formatINR(totalElec);
  results.total.textContent     = formatINR(totalExp);
  results.perPerson.textContent = formatINR(perPerson);

  // Breakdown bar
  if (totalExp > 0) {
    rentSeg.style.width = ((rent      / totalExp) * 100).toFixed(2) + '%';
    foodSeg.style.width = ((food      / totalExp) * 100).toFixed(2) + '%';
    elecSeg.style.width = ((totalElec / totalExp) * 100).toFixed(2) + '%';
  } else {
    rentSeg.style.width = foodSeg.style.width = elecSeg.style.width = '0%';
  }

  resultsCard.classList.remove('hidden');
  resultsCard.style.animation = 'none';
  resultsCard.offsetHeight;
  resultsCard.style.animation = '';

  // Save to history
  const entry = {
    id:        Date.now(),
    date:      new Date().toISOString(),
    rent, food, units, rate, persons,
    totalElec, totalExp, perPerson,
  };
  saveHistory(entry);
  renderHistory();

  setTimeout(() => {
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 80);
}

// ── Reset ────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  form.reset();
  clearAllErrors();
  resultsCard.classList.add('hidden');

  Object.values(inputs).forEach((inp, i) => {
    inp.style.transition = `background ${0.2 + i * 0.04}s`;
    inp.style.background = 'rgba(124,110,247,0.08)';
    setTimeout(() => { inp.style.background = ''; }, 400);
  });

  inputs.rent.focus();
});

// ── History: Load / Save ─────────────────────────────────────
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  const hist = loadHistory();
  hist.unshift(entry);            // newest first
  if (hist.length > MAX_HISTORY) hist.splice(MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}

function deleteHistoryEntry(id) {
  const hist = loadHistory().filter(e => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  renderHistory();
}

function clearAllHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function loadEntryIntoForm(entry) {
  inputs.rent.value    = entry.rent;
  inputs.food.value    = entry.food;
  inputs.units.value   = entry.units;
  inputs.rate.value    = entry.rate;
  inputs.persons.value = entry.persons;
  clearAllErrors();
  calculate();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── History: Render ──────────────────────────────────────────
function renderHistory() {
  const hist = loadHistory();
  historyList.innerHTML = '';

  if (hist.length === 0) {
    historyCard.classList.remove('hidden');
    historyEmpty.classList.remove('hidden');
    return;
  }

  historyCard.classList.remove('hidden');
  historyEmpty.classList.add('hidden');

  hist.forEach((entry, idx) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.animationDelay = `${idx * 0.04}s`;
    item.innerHTML = `
      <div class="history-meta">
        <span class="history-date">
          <i class="fa-regular fa-clock"></i>&nbsp;${formatDate(entry.date)}
        </span>
        <div class="history-summary">
          <span><i class="fa-solid fa-house"></i> Rent: ${formatINR(entry.rent)}</span>
          <span><i class="fa-solid fa-utensils"></i> Food: ${formatINR(entry.food)}</span>
          <span><i class="fa-solid fa-bolt"></i> Elec: ${formatINR(entry.totalElec)}</span>
          <span><i class="fa-solid fa-people-group"></i> ${entry.persons} person${entry.persons > 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="history-result">
        <span class="history-total-label">Each pays</span>
        <span class="history-per-person">${formatINR(entry.perPerson)}</span>
        <span class="history-total-label">Total</span>
        <span class="history-total-val">${formatINR(entry.totalExp)}</span>
      </div>
      <div class="history-actions">
        <button class="history-action-btn reload-btn" data-id="${entry.id}" title="Load this calculation">
          <i class="fa-solid fa-rotate"></i> Reload
        </button>
        <button class="history-action-btn delete" data-id="${entry.id}" title="Delete entry">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    `;
    historyList.appendChild(item);
  });

  // Delegate clicks
  historyList.querySelectorAll('.reload-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id    = parseInt(btn.dataset.id);
      const entry = loadHistory().find(e => e.id === id);
      if (entry) loadEntryIntoForm(entry);
    });
  });

  historyList.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = parseInt(btn.dataset.id);
      const item = btn.closest('.history-item');
      item.style.transition = 'all 0.3s ease';
      item.style.opacity    = '0';
      item.style.transform  = 'translateX(30px)';
      setTimeout(() => deleteHistoryEntry(id), 300);
    });
  });
}

// ── Clear All History ────────────────────────────────────────
clearHistoryBtn.addEventListener('click', () => {
  if (loadHistory().length === 0) return;
  clearHistoryBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Clearing…';
  setTimeout(() => {
    clearAllHistory();
    clearHistoryBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Clear All';
  }, 400);
});

// ── Card shake animation on error ────────────────────────────
function shakeCard() {
  const card = document.getElementById('calcCard');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97)';
  card.addEventListener('animationend', () => { card.style.animation = ''; }, { once: true });
}

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    15%      { transform: translateX(-8px); }
    30%      { transform: translateX(7px); }
    45%      { transform: translateX(-5px); }
    60%      { transform: translateX(4px); }
    75%      { transform: translateX(-2px); }
  }
`;
document.head.appendChild(shakeStyle);

// ── Enter key navigation ─────────────────────────────────────
const fieldOrder = ['rent', 'food', 'units', 'rate', 'persons'];
fieldOrder.forEach((key, idx) => {
  inputs[key].addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (idx < fieldOrder.length - 1) inputs[fieldOrder[idx + 1]].focus();
      else calculate();
    }
  });
});

// ── Init: render saved history on page load ──────────────────
(function init() {
  if (loadHistory().length > 0) renderHistory();
})();