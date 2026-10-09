# 🎙️ LocalPlaud

> **100% Local, Private, Open-Source PLAUD AI Studio, Direct Hardware Communicator, Neural Speaker Diarization & Meeting Intelligence Suite.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Whisper](https://img.shields.io/badge/AI_Engine-Faster--Whisper_INT8-FF6F00?logo=openai&logoColor=white)](https://github.com/SYSTRAN/faster-whisper)
[![Zero Cloud](https://img.shields.io/badge/Privacy-100%25_Local_Zero--Cloud-10B981)](#-zero-cloud-privacy-guarantee)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

**LocalPlaud** is a desktop AI Voice Intelligence Studio designed to communicate directly with **PLAUD NOTE**, **PLAUD NOTE PIN**, and **PLAUD NOTE PRO** hardware devices—as well as connected **Android / Google Pixel** smartphones—**completely eliminating the need for the proprietary Plaud mobile app or cloud subscriptions**.

Everything runs **100% locally on your machine**: direct hardware flash memory audio extraction, local neural speech-to-text transcription via Whisper, multi-speaker diarization, interactive multi-color audio waveforms, executive briefings, action items, and interactive visual mind maps.

---

## ✨ Key Features

### 🔌 1. Direct Hardware Communication & Manipulation
* **No Mobile App Needed:** Connect directly to your Plaud hardware via **Web Bluetooth (BLE)** or **USB Mass Storage / MTP**.
* **Direct Hardware Audio Vault Reader:** Automatically identifies your Plaud hardware serial (e.g., `8810B30245187993`) and lists raw `.ogg`, `.opus`, `.wav`, and `.mp3` recordings from flash memory.
* **Hardware Manipulation:**
  * 🗑️ **Delete from Device:** Permanently wipe recording sectors from physical flash memory to reclaim onboard storage.
  * ✏️ **Rename on Device:** Directly update recording titles and catalogue indexes.
  * 🕒 **Sync Hardware RTC Clock:** Calibrate the Plaud device's internal Real-Time Clock with host atomic time.
* **Dual-Mode Sensor Detection:** Recognizes whether recordings were captured using **Air Mic (Dual Knowles MEMS Beamforming)** or **VCS (Body-conduction vibration phone call sensor)**.

### 🧠 2. Real-Time Neural Transcription & Diarization
* **Powered by `faster-whisper` (CTranslate2 INT8):** Ultra-fast CPU/GPU neural speech transcription.
* **Verbatim Speech-to-Text:** Exact word-level and sentence-level timestamps.
* **Speaker Identification & Separation:** Automatically identifies distinct speakers (**Speaker 1**, **Speaker 2**, **Speaker 3**) with customizable names, avatars, and color tags.
* **Speaker Analytics:** Real-time talk-time percentage distribution bar charts.
* **Self-Healing Failsafe:** Built-in automated diagnostic engine that validates, provisions, and repairs the Python Whisper environment automatically on boot.

### 📊 3. Plaud-Grade Meeting Intelligence & Visual Mind Map
* **Executive Briefings:** High-impact structured TL;DR summaries.
* **Key Discussion Points:** Granular bullet-point takeaways.
* **Interactive Action Items:** Checkbox deliverables with assignees, due dates, and priority indicators.
* **Interactive Visual Mind Map:** Signature hierarchical knowledge graph with zoom, pan, collapsible branch nodes, and Markdown export.
* **Ask Plaud AI Chat:** Grounded conversational assistant to query meetings (*"Draft a follow-up email"*, *"What deadlines did Sarah commit to?"*).

### 🎧 4. Segmented Multi-Color Waveform Audio Player
* **Speaker-Colored Waveform Canvas:** Visualizes speech segments color-coded by active speaker.
* **Click-to-Seek Synchronization:** Clicking any transcript utterance or waveform bar instantly seeks audio playback.
* **Playback Controls:** 0.5x – 2.0x speed adjustment, 5s rewind, 10s skip, and volume booster.

### 📤 5. Multi-Format Exporting
* Export intelligence dossiers to **Markdown (.md)**, **Plain Text (.txt)**, **Subtitles (.srt)**, or **JSON**.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAUD HARDWARE ECOSYSTEM                 │
│   [ Plaud Note Pro ]    [ Plaud NotePin ]    [ Pixel / MTP ]│
└──────────────────────────────┬──────────────────────────────┘
                               │ USB-C / Web Bluetooth (BLE GATT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 LOCALPLAUD BACKEND (Node.js)                │
│  • Direct Hardware Vault Scanner   • MTP / USB File Manager │
│  • Audio Converter (FFmpeg)        • Device Controller API  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Python Subprocess IPC
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               LOCAL AI INFERENCE PIPELINE                   │
│  • faster-whisper (CTranslate2 INT8 CPU Multithreaded)      │
│  • Voice Activity Detection (VAD Filter)                    │
│  • Turn-Taking Diarization & Speaker Clustering             │
│  • Knowledge Graph & Action Item Synthesis Engine           │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON Streaming
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 VITE + REACT 18 STUDIO UI                   │
│  • Multi-Color Waveform Canvas     • Interactive Mind Map   │
│  • Synchronized Transcript Player  • Ask AI Assistant       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
* **Node.js** v18.0+ or v20.0+
* **Python** 3.10+
* **FFmpeg** (installed and available in `PATH`)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/LocalPlaud.git
cd LocalPlaud

# Install frontend and backend Node dependencies
npm install
```

### 2. Start the Studio
```bash
# Starts both the backend server (Port 3001) and Vite studio (Port 5173)
npm start
```
*(Or run `npm run dev` and `npm run server` in separate terminals).*

### 3. Open in Browser
Navigate to **[http://localhost:5173](http://localhost:5173)** in Google Chrome, Microsoft Edge, or any Chromium-based browser.

---

## 📱 Connecting Your Devices

### Option A: Direct Web Bluetooth (BLE)
1. Open the studio at `http://localhost:5173`.
2. Click **"Pixel 11 Pro / Plaud"** in the top header.
3. On the **Direct Bluetooth BLE** tab, click **"Pair Plaud Device"**.
4. Select your **PLAUD NOTE** from the browser popup.
5. Click **"Stream & Diarize"** on any file to stream raw audio packets directly into your studio.

### Option B: Google Pixel / Android USB (MTP)
1. Connect your phone via USB-C to your computer.
2. Unlock the screen, swipe down the notification bar, and select **"File Transfer"** (MTP mode).
3. Open the studio — LocalPlaud automatically discovers the Plaud device storage vault and lists all recordings ready for 1-click extraction.

---

## 📂 Project Structure

```
LocalPlaud/
├── data/
│   ├── recordings/         # Local audio storage vault (MP3/WAV/OGG)
│   └── recordings.json     # Metastore for transcripts, mindmaps, and tasks
├── server/
│   ├── index.js            # Express API, MTP scanner & hardware controller
│   ├── transcribe.py       # Python speech-to-text & speaker diarizer
│   └── venv/               # Self-contained Python virtual environment
├── src/
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── SummaryTab.jsx      # Executive briefing & task checkboxes
│   │   │   ├── TranscriptTab.jsx   # Diarized transcript & speaker rename
│   │   │   ├── MindMapTab.jsx      # Visual interactive knowledge graph
│   │   │   └── AskAiTab.jsx        # Grounded meeting chat assistant
│   │   ├── AudioPlayer.jsx         # Segmented speaker waveform player
│   │   ├── DeviceManagerModal.jsx  # Direct hardware manager (delete/rename)
│   │   ├── Header.jsx              # Navigation, device pill & actions
│   │   ├── Sidebar.jsx             # Category filtering & recording list
│   │   ├── LiveRecordModal.jsx     # In-browser dual-sensor mic recorder
│   │   ├── SettingsModal.jsx       # Whisper health check & API keys
│   │   └── UploadModal.jsx         # Audio file drag & drop importer
│   ├── utils/
│   │   └── plaudBle.js             # Web Bluetooth Nordic UART & GATT protocol
│   ├── App.jsx                     # Root application state orchestrator
│   ├── index.css                   # Glassmorphic dark styling
│   └── main.jsx                    # React DOM entry point
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🔒 Zero-Cloud Privacy Guarantee

* **No Telemetry / No Tracking:** Zero audio data or transcripts ever leave your local computer.
* **Air-Gapped Compatible:** Operates with 100% functionality without an active internet connection.
* **Your Data is Yours:** Recordings, mind maps, and transcripts are stored directly in your local `data/` folder as open standard JSON and MP3 files.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
