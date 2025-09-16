# Cora - AI Assistant

Cora is an AI assistant that runs **entirely in the browser**. Primary path uses **WebLLM + WebGPU**. If WebGPU isn't available, we **fallback to WASM** via **wllama** (no server, no keys).

## Features
- OpenAI-compatible **WebLLM** with **streaming** output
- **Web Search** integration via local SearXNG instance for real-time information
- **RAG System** with PouchDB for document upload and knowledge base management
- **Function calling** with manual pattern detection for web search
- **Service Worker** caching (static assets + model shards for repeat loads)
- **PWA** packaging (installable, offline-first UX)
- **WASM fallback** using **wllama** (single-thread by default to avoid COOP/COEP headers)
- **Multiple themes** (8 themes including Light, Dark, Ocean, Forest, etc.)
- **AI Personas** with customizable system prompts and settings
- **Curated model selection** optimized for browser performance

## Quick Start

### Development Server (Recommended)
```bash
cd web
npm install
npm run dev
```
Open **http://localhost:8000** in **Chrome/Edge** (WebGPU enabled).

### Static Server
1. **Serve statically** (any static server). Examples:
   - Python: `cd web && python -m http.server 8000`
   - Node (http-server): `npx http-server web -p 8000`
2. Open **http://localhost:8000** in **Chrome/Edge** (WebGPU enabled). First model load may take time (cached for next runs).
3. Click **Settings ⚙** to pick a model. Try the defaults first.

### Web Search Setup (Optional)
For web search functionality:
```bash
cd web
docker-compose up -d  # Starts local SearXNG on port 8888
```
The app will use `[SEARCH: query]` pattern to trigger searches.

> If WebGPU is unavailable (or blocked), the app will **auto-switch to WASM**. This path uses a tiny demo GGUF so it loads quickly.

## Folder Map
```
/web
  index.html           # UI, registers SW, loads app.js
  app.js               # WebLLM logic + fallback orchestrator
  styles.css
  sw.js                # Service worker: caches app + model shards
  manifest.json        # PWA manifest
/fallback
  wllama.js            # WASM fallback using @wllama/wllama CDN
/tools
  quantize.py          # Notes & helper scaffold for GGUF prep (optional)
/docs
  pwa.md               # PWA/offline notes
  models.md            # Model choices, tradeoffs
/public
  icon-192.png         # Placeholder PWA icons
  icon-512.png
```

## Curated Models

The app includes carefully selected models optimized for browser performance:

- **SmolLM2 135M** - Ultra-fast, minimal resource usage (~100MB)
- **Qwen 2.5 0.5B** - Balanced efficiency with multilingual support (~300MB)
- **DeepSeek 1.5B** - Efficient general-purpose model with strong reasoning (~900MB)
- **Phi 3.5 Mini** - Excellent for coding and reasoning tasks (~2.1GB)
- **Gemma 2 2B** - Google's balanced model with strong capabilities (~1.3GB)
- **Hermes 3 Llama 8B** - Advanced with function calling & web search (~4.5GB)

## Recent Updates

### Latest Changes
- **Fixed scrolling** in main chat window with custom scrollbar styling
- **Added DeepSeek model** back to the curated list
- **Improved web search UI** - shows clean animation instead of raw results
- **Removed incompatible models** (Llama 3.2 1B, TinyLlama) that don't support function calling
- **Enhanced RAG system** with better error handling and UI feedback

## Browser Support
- WebGPU: Chrome/Edge stable; Safari improving; Firefox partial (behind flags).
- WASM fallback works on most modern browsers.

## Notes
- Default **WebLLM** models come from MLC’s prebuilt list and will stream from CDN/HF on first load.
- Service worker caches **static assets** and tries to cache **model shards** so subsequent loads are faster.
- For **wllama** multi-threading, you would need COOP/COEP headers. We default to single-thread to keep it simple.

## Credits
- WebLLM by the MLC team.
- wllama by @ngxson (WASM binding for llama.cpp).
