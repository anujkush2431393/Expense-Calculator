# 🏠 SplitRent — Rent & Expense Calculator

A modern, responsive rent and shared expense calculator with glassmorphism UI, dark/light mode, and persistent calculation history.

---

## 📸 Features

- **Instant calculation** of electricity bill, total expenses, and per-person share
- **Calculation history** saved to `localStorage` — persists across page reloads
- **Reload any past entry** back into the form with one click
- **Dark / Light mode** toggle with preference saved across sessions
- **Input validation** with inline error messages and card shake animation
- **Proportional breakdown bar** showing rent, food, and electricity share visually
- **Persons stepper** (+/−) for easy mobile input
- **Keyboard navigation** — `Enter` moves between fields, submits on the last
- **Fully responsive** — mobile, tablet, and desktop layouts
- **Glassmorphism design** with animated background blobs and smooth transitions

---

## 📁 Project Structure

```
splitrent/
├── index.html   # App markup and structure
├── style.css    # All styles, themes, animations, and responsive rules
├── script.js    # Calculation logic, validation, history, and theme toggle
└── README.md    # This file
```

No build tools, no dependencies, no npm — just open `index.html` in a browser.

---

## 🚀 Getting Started

1. **Download or clone** the repository
2. Keep all three files (`index.html`, `style.css`, `script.js`) in the **same folder**
3. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge)
4. Start calculating!


---

## 🧮 Calculation Logic

| Variable | Formula |
|---|---|
| Total Electricity Bill | `units_consumed × charge_per_unit` |
| Total Expenses | `rent + food + electricity_bill` |
| Each Person Pays | `total_expenses ÷ number_of_persons` |



