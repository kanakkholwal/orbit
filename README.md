# Orbit PDF 🚀

**Master your PDFs with absolute privacy.**

Orbit PDF is a professional, high-performance PDF toolkit that runs entirely in your browser. By leveraging powerful WebAssembly (WASM) engines, it ensures your documents never leave your device, providing world-class security and speed.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Svelte](https://img.shields.io/badge/Svelte-5.0-ff3e00?logo=svelte)](https://svelte.dev)
[![WASM](https://img.shields.io/badge/Engine-WASM-654ff0?logo=webassembly)](https://webassembly.org)

## ✨ Why Orbit PDF?

*   **🔒 100% Private & Secure**: All processing happens locally in your browser's sandbox. Zero server uploads, zero data transfer.
*   **⚡ Native Speed**: Powered by a high-performance WASM engine for desktop-class processing speeds.
*   **📱 Offline Capable**: Fully functional without an internet connection. Install it as a PWA for a seamless desktop experience (available soon).
*   **♾️ Unlimited Everything**: No daily quotas, no file size caps, and no subscriptions. Batch process as much as your hardware handles.

## 🛠️ Essential Tools

| Tool | Description |
| :--- | :--- |
| **Merge PDF** | Combine multiple files into one. Drag and drop to reorder. |
| **Split PDF** | Extract pages, split ranges, or divide files into multiple documents. |
| **Compress PDF** | Reduce file sizes while maintaining professional quality. |
| **Image to PDF** | Instant conversion for JPG, PNG, and HEIC formats. |
| **PDF Multi-Tool** | The ultimate workspace to rearrange, rotate, and export pages. |

## 🚀 Tech Stack

Orbit PDF is built with cutting-edge technologies for maximum performance and reliability:

- **Frontend**: [Svelte 5](https://svelte.dev/) (Runes), [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **PDF Core**: [`pdf-lib`](https://pdf-lib.js.org/), [`pdfjs-dist`](https://mozilla.github.io/pdf.js/)
- **WASM Engine**: [`@neslinesli93/qpdf-wasm`](https://github.com/neslinesli93/qpdf-wasm)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Linting**: [Biome](https://biomejs.dev/)

## 🛠️ Local Development

### Prerequisites

You'll need [Bun](https://bun.sh/) (recommended) or Node.js installed.

### Installation

```sh
# Clone the repository
git clone https://github.com/kanakkholwal/orbit.git

# Navigate to the project
cd orbit

# Install dependencies
bun install
```

### Development

```sh
# Start the development server
bun run dev

# Open in browser
# http://localhost:5173
```

### Building for Production

```sh
# Create a production build
bun run build

# Preview the build
bun run preview
```

## 🤝 Contributing

Contributions are welcome! If you have an idea for a tool or a feature, feel free to open an issue or submit a pull request.

## 📦 Dependency Licenses

Orbit PDF uses a number of open-source dependencies. Because several dependencies use licenses other than MIT (Apache-2.0, OFL-1.1, MPL-2.0), the project as a whole is licensed under GPL-3.0. Below is a summary of the key dependency licenses:

### Direct Dependencies

| Package | License | Notes |
| :--- | :--- | :--- |
| `svelte`, `@sveltejs/kit` | MIT | Frontend framework |
| `tailwindcss`, `@tailwindcss/vite` | MIT | CSS framework |
| `pdf-lib` | MIT | PDF creation & manipulation |
| `@pdf-lib/fontkit` | MIT | Font embedding for pdf-lib |
| `@embedpdf/*` (core, plugins) | MIT | PDF viewer engine |
| `@lucide/svelte` | ISC | Icon library |
| `@neslinesli93/qpdf-wasm` | ISC | WASM-based PDF compression |
| `nanoid` | MIT | Unique ID generation |
| `clsx`, `tailwind-merge` | MIT | CSS utility helpers |
| `mode-watcher` | MIT | Dark/light mode management |
| `sortablejs` | MIT | Drag-and-drop sorting |
| `heic2any` | MIT | HEIC image conversion |
| `jszip` | MIT OR GPL-3.0-or-later | ZIP file handling (used under MIT) |
| `node-forge` | BSD-3-Clause OR GPL-2.0 | Cryptography (used under BSD-3-Clause) |
| `pdfjs-dist` | **Apache-2.0** | Mozilla's PDF.js renderer |
| `tesseract.js` | **Apache-2.0** | OCR engine |
| `xlsx` | **Apache-2.0** | Spreadsheet parsing |
| `@tauri-apps/cli`, `@tauri-apps/*` | **Apache-2.0 OR MIT** | Desktop app framework (dual-licensed) |
| `@fontsource-variable/google-sans` | **OFL-1.1** | Google Sans variable font |
| `@embedpdf/fonts-*` | **OFL-1.1** | Bundled font files (Arabic, Hebrew, CJK, Latin) |

### Transitive Dependencies (notable)

| Package | License | Notes |
| :--- | :--- | :--- |
| `lightningcss` | **MPL-2.0** | CSS transformation (used by Tailwind CSS internally) |
| `pako` | MIT AND Zlib | Zlib compression |
| Various `@babel/*` | MIT | Build tooling |
| Various `@types/*` | MIT | TypeScript type definitions |

### License Compatibility Summary

| License | Count | Description |
| :--- | :---: | :--- |
| MIT / MIT* | ~145 | Permissive — no restrictions on use |
| ISC | 5 | Functionally equivalent to MIT |
| 0BSD | 1 | Public-domain equivalent |
| Apache-2.0 | 18 | Permissive, requires attribution; compatible with GPL-3.0 |
| Apache-2.0 OR MIT | 6 | Dual-licensed permissive (Tauri) |
| BSD-2-Clause / BSD-3-Clause | 3 | Permissive — requires attribution |
| OFL-1.1 | 8 | Font license — embedded fonts may not be sold standalone |
| MPL-2.0 | 2 | Weak copyleft (lightningcss — transitive) |
| MIT OR GPL-3.0-or-later | 1 | Dual-licensed (jszip, used under MIT) |
| BSD-3-Clause OR GPL-2.0 | 1 | Dual-licensed (node-forge, used under BSD-3-Clause) |
| MIT AND Zlib | 1 | Permissive combination (pako) |

> **Why GPL-3.0?**
> The presence of Apache-2.0 licensed packages (pdfjs-dist, tesseract.js, xlsx) and MPL-2.0 packages (lightningcss) means that not all dependencies are MIT. Apache-2.0 is compatible with GPL-3.0 (but **not** GPL-2.0), so GPL-3.0 is the appropriate copyleft license for this project. This ensures that any fork or derivative work of Orbit PDF must also be open-source under the same terms and must credit the original authors.

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)** — see the [LICENSE](LICENSE) file for details.

**What this means for you:**
- ✅ You may use, study, and modify this software freely.
- ✅ You may distribute copies of the original or modified versions.
- ⚠️ Any distributed fork or derivative work **must** also be released under GPL-3.0.
- ⚠️ You **must** provide the source code when distributing the software.
- ⚠️ You **must** retain and display the original copyright notice and credit **Kanak Kholwal / Orbit PDF**.

Copyright (C) 2026 Kanak Kholwal — <https://github.com/kanakkholwal/orbit>

---
