# Stable Version v1.0.0

## Release Date
- Tagged: 2025-01-11
- Branch: stable-v1.0.0
- Commit: f34787a

## Features
- ✅ React 19 with Vite build system
- ✅ WebGPU detection with automatic fallback
- ✅ WebLLM integration with 100+ models
- ✅ WASM fallback using wllama
- ✅ Bright gradient theme (purple/pink)
- ✅ Model selector in settings dialog
- ✅ Streaming responses
- ✅ PWA support with service worker
- ✅ Responsive design with Tailwind CSS

## Tech Stack
- **Frontend**: React 19.1.1, Vite 7.1.5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (button, dialog)
- **Icons**: Lucide React
- **LLM Runtime**: WebLLM (WebGPU) / wllama (WASM)

## Key Files
- `/src/App.jsx` - Main chat interface
- `/src/lib/llm-service.js` - LLM abstraction service
- `/src/components/ui/` - Reusable UI components
- `/sw.js` - Service worker for caching
- `/manifest.json` - PWA manifest

## Dependencies Lock
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "vite": "^7.1.5",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.544.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "class-variance-authority": "^0.7.1"
}
```

## CDN Resources
- WebLLM: https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.73/+esm
- wllama: https://unpkg.com/@wllama/wllama@2.1.0/esm/wllama.js

## Protection Status
- ✅ Tagged as v1.0.0-stable
- ✅ Backup branch: stable-v1.0.0
- ✅ Pushed to remote repository
- ✅ Clean working tree

## Recovery Instructions
To restore this exact version:
```bash
git fetch --all --tags
git checkout v1.0.0-stable
# Or use the stable branch:
git checkout stable-v1.0.0
```

## Known Working Configuration
- Node.js 18+
- npm 9+
- Modern browser with WebGPU or WASM support
- Development server: `npm run dev` (port 8000)
- Build: `npm run build`