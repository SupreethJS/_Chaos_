# ⚡ JARVIS — The Time Traveller (CHAOS Agent)

> An autonomous, cross-device agentic workspace that executes real multi-step tasks across apps, runs seamlessly on mobile, tablet, and desktop as an installable PWA, and actively recognizes failures with self-healing recovery.

---

## 🌟 Key Pillars & Capabilities

### 1. 🔄 Real Multi-Step Tasks Across Apps
- **Cross-App Pipeline Execution**: Executes end-to-end workflows that span multiple standalone applications without user intervention:
  1. **AI Workspace**: Queries intelligence models, performs deep synthesis, extracts empirical metrics, and indexes peer-reviewed citations.
  2. **Document Studio**: Automatically structures research into an Executive Brief (A4 format) with executive summaries and formatted references.
  3. **Security Gate**: Performs strict structural schema validation and verifies 3+ active citations against technical registries.
  4. **PDF Engine**: Compiles binary PDF documents via the Node.js PDFKit backend service, ready for direct download.
  5. **Email Composer**: Composes an executive dispatch with audit tags, pausing at an explicit **Human-in-the-Loop Confirmation Gate**.
- **Real-World Scenarios**: Includes presets for Clean Tech Breakthroughs, Autonomous Agent Safety & NIST Memo, and Post-Quantum Cryptography Vulnerability Assessment.
- **Cross-App Data Continuity**: Artifacts generated in the orchestrator pipeline automatically populate Document Studio and Email Composer for immediate inspection.

### 2. 🛡️ Autonomous Failure Recognition & Self-Healing
- **Failure Anomaly Detection**: Actively monitors task execution and recognizes failures (e.g. citation corruption, missing schemas, or integrity constraint violations).
- **Diagnostic Root-Cause Banner**: Renders real-time diagnostic alerts detailing the exact error type, affected pipeline stage, and anomaly metrics.
- **Self-Healing Recovery Engine**: Automatically triggers an autonomous recovery loop that queries fallback registries, repairs missing schema attributes or citations, re-runs integrity validation, and marks the step as `Auto-Repaired` before proceeding.
- **Live Audit Telemetry**: Full event log terminal tracking real-time timestamps, originating apps, and resolution logs.

### 3. 📱 Works Across Devices (PWA & Instant Sync)
- **Progressive Web App (PWA)**: Built with Workbox service workers, offline caching, and responsive layouts tailored for mobile, tablet, and desktop (`viewport-fit=cover`).
- **Interactive Viewport Switcher**: Test directly inside the UI between **Desktop (Fluid)**, **Tablet (768px)**, and **Mobile PWA (390px)** simulated frames.
- **Instant Mobile Handover**: Live geometric SVG QR Code with embedded cybernetic logo for seamless instant session transfer to smartphones and tablets.
- **Device Capability Audit Matrix**: Real-time inspection of detected form factor, viewport dimensions, Device Pixel Ratio (DPR), standalone PWA mode, Web Speech API readiness, and WebGL GPU hardware acceleration.

### 4. 🎙️ Cybernetic Voice Mode & 3D WebGL Shader
- Continuous voice conversation powered by Web Speech API.
- Live interactive 3D WebGL pulsing shader orb with real-time speech telemetry (decibels, pitch, frequency spectral analysis).

### 5. 🎨 Aesthetic & UX Design System
- Dynamic Theme Switcher: High-contrast Dark Mode with cybernetic blue/violet accents and custom-designed Pastel Light Mode with animated micro-interactions.
- Custom Brand Identity: Cybernetic "J" logo, animated gradient hero badges, and glassmorphic card layouts.

---

## 🏗️ Architecture

```
chaos/
├── package.json                         # Root workspace scripts & monorepo orchestration
├── .gitignore                           # Git ignore rules for node_modules, dist, .env
├── README.md                            # Complete documentation
└── chaos-agent-starter/
    ├── backend/                         # Express + TypeScript API server
    │   ├── src/
    │   │   ├── index.ts                 # Endpoints: /api/chat, /api/pdf, /api/email, /api/health
    │   │   └── supabase.ts              # Supabase database client setup
    │   ├── package.json
    │   └── tsconfig.json
    └── frontend/                        # React 19 + TypeScript + Vite PWA
        ├── src/
        │   ├── App.tsx                  # Main application controller & routing
        │   ├── MultiStepTaskRunner.tsx  # Autonomous cross-app task runner & self-healing
        │   ├── CrossDeviceHandover.tsx  # PWA handover, QR sync, and device capability audit
        │   ├── VoiceModal.tsx           # Continuous voice interface & WebGL shader sphere
        │   ├── LoginPage.tsx            # Animated pastel/cybernetic authentication portal
        │   ├── DocumentStudio.tsx       # Document generator, validator, and PDF downloader
        │   ├── EmailComposer.tsx        # Email drafting with Human-in-the-Loop security gate
        │   ├── ConversationHistory.tsx  # Date-grouped searchable conversation archive
        │   ├── styles.css               # Vanilla CSS design tokens & animations
        │   └── main.tsx                 # PWA service worker registration & entry point
        ├── public/
        │   └── manifest.webmanifest     # PWA standalone manifest configuration
        ├── package.json
        └── vite.config.ts               # Vite configuration with VitePWA plugin
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or v22 recommended
- **npm**: v10+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SupreethJS/_Chaos_.git
   cd _Chaos_
   ```

2. Install dependencies for the workspace:
   ```bash
   cd chaos-agent-starter/backend
   npm install
   cp .env.example .env

   cd ../frontend
   npm install
   cp .env.example .env
   ```

### Running the Services Locally

In Terminal 1 (Backend API on `http://localhost:4000`):
```bash
cd chaos-agent-starter/backend
npm run dev
```

In Terminal 2 (Frontend Client on `http://localhost:5173`):
```bash
cd chaos-agent-starter/frontend
npm run dev
```

Or from the root directory:
```bash
npm run dev:backend
npm run dev:frontend
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing the Autonomous Capabilities

1. **Multi-Step Task Execution**:
   - Navigate to the **Multi-Step Tasks (Cross-App)** tab in the sidebar.
   - Click **Run Multi-Step Task**.
   - Observe the 5-step sequence execute sequentially across apps with live duration metrics and artifact passing.
2. **Failure Recognition & Self-Healing**:
   - Scroll to the **Chaos & Failure Recognition Tester** dock at the bottom of the orchestrator.
   - Click **Simulate Failure & Test Self-Healing**.
   - Watch the agent catch the `INTEGRITY_CONSTRAINT_VIOLATION`, display the failure diagnostic alert, automatically inject citations from fallback memory, and self-heal the step to `Auto-Repaired`.
3. **Cross-Device Handover**:
   - Click on the **Cross-Device Sync (PWA)** tab.
   - Scan the QR code or click **Copy Mobile Link** to test on another device.
   - Toggle the **Preview Device Mode** buttons (`Tablet`, `Mobile PWA`) to verify responsive layout adaptability.

---

## 🔒 Security & Policies
- **Human-in-the-Loop Dispatch**: Email dispatches require manual user confirmation before external delivery.
- **Protected Environment Variables**: Never commit `.env` containing production API keys.

---

## 📄 License
MIT
