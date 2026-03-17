# Financial Recovery

A personal finance desktop app built with React + Electron for Canadians who want full control over their financial data — offline, private, and no subscriptions.

![Platform](https://img.shields.io/badge/platform-macOS-lightgrey) ![Stack](https://img.shields.io/badge/stack-React%20%2B%20Electron-blue) ![License](https://img.shields.io/badge/license-private-red)

---

## Features

### Dashboard
- Income, spending, and net summary tiles
- Spending by category pie chart (synced to period filter)
- Monthly income vs expenses trend chart
- Net worth trend over time
- Suspicious transaction alerts
- Period filter (All / 6 Mo / 3 Mo / individual months) in the topbar

### My Recovery
Three sub-tabs to guide your financial recovery:

- **Overview** — Debt payoff tracker, recovery score, and action plan
- **Diagnostics** — Spend Check analysis with category benchmarks, weekend vs weekday spending, dining vs grocery split, income concentration risk, flagged transactions panel
- **Goals & Savings** — Savings goals progress, emergency fund runway, debt payoff projections

### My Finances
- Full transaction ledger with search, filter by account/category/date
- Suspicious transaction badges (duplicates, fraud bursts, unusually large charges, large ATM withdrawals)
- Merchant category overrides (right-click to re-categorize any transaction)
- Recurring payment detection

### Ledger
- Per-account transaction view
- Balance reconciliation panel — compares expected vs computed balance per account and flags discrepancies

### Net Worth
- Assets vs liabilities breakdown
- Manual asset entry (real estate, vehicles, investments)
- Per-account balances with correct type labels (Chequing, Savings, Credit Card, Line of Credit, Mortgage, Vehicle Loan)
- Debt entries with proper type detection

### AI Advisor (Local)
- Powered by **Ollama** running locally (no data leaves your machine)
- Uses `qwen3:8b` model by default
- Full financial context injected into every prompt (health score, DTI, net worth, account balances, savings goals)
- Chat history per session

### Tax & Income
- Income source breakdown
- Per-paycheque breakdown card
- Tax estimation tools

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 + Tailwind CSS |
| Desktop | Electron 41 |
| Charts | Recharts |
| PDF parsing | pdf.js |
| OCR | Tesseract.js |
| CSV parsing | PapaParse |
| Drag & drop | dnd-kit |
| AI | Ollama (local) |
| Build | Vite 5 + electron-builder |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- macOS (Windows/Linux not tested)
- [Ollama](https://ollama.com/) (optional — only needed for AI Advisor)

### Install

```bash
git clone https://github.com/YaBoiZo/Financial-Recovery.git
cd Financial-Recovery
npm install
```

### Run in Development

```bash
npm run electron:dev
```

This starts Vite on `localhost:5173` and launches Electron pointing at it. Hot reload is active for UI changes.

### Run Web Only (no Electron)

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for macOS

```bash
npm run electron:build:mac
```

Output: `release/Financial Recovery-x.x.x.dmg` for both Apple Silicon (arm64) and Intel (x64).

### Build for Windows

Run this on a Windows machine:

```bash
npm run electron:build:win
```

Output: `release/Financial Recovery Setup x.x.x.exe` (NSIS installer) and a portable `.exe`. Both are 64-bit.

### Build for Linux

```bash
npm run electron:build:linux
```

Output: `.AppImage` and `.deb` in the `release/` folder.

> **Cross-platform builds**: Building a Windows `.exe` from macOS requires Wine and is not recommended. Build on the target OS for best results.

---

## AI Advisor Setup (Optional)

The AI Advisor tab requires Ollama running locally:

1. Install Ollama: https://ollama.com/download
2. Pull the model:
   ```bash
   ollama pull qwen3:8b
   ```
3. Make sure Ollama is running (`ollama serve`) before opening the app

The app sends requests to `http://localhost:11434`. No data is sent to any external server.

---

## Importing Your Data

The app accepts:
- **CSV exports** from TD Bank (chequing, savings, credit card)
- **PDF statements** (auto-parsed or OCR-assisted)
- **Images** of statements (OCR via Tesseract)

Drag and drop files onto the import area in **My Finances**. The app auto-detects account type from the filename and content.

Supported account types: Chequing, Savings, Credit Card, Line of Credit, Mortgage, Vehicle Loan, Investment, Rental Income.

> **Note:** Your financial data is stored locally in `localStorage` and never leaves your machine.

---

## Project Structure

```
Financial-Recovery/
├── electron/
│   └── main.cjs          # Electron main process
├── src/
│   ├── App.jsx            # Entire app (single-file React component)
│   ├── main.jsx           # React entry point + error boundary
│   └── index.css          # Global styles + Tailwind
├── public/
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Privacy

All data is stored locally in your browser's `localStorage`. Nothing is transmitted to any server. The AI Advisor uses a local Ollama instance — your financial data never touches the internet.
