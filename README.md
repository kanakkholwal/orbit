# Orbit PDF 🚀

**Master your PDFs with absolute privacy.**

Orbit PDF is a professional, high-performance PDF toolkit that runs entirely in your browser. By leveraging powerful WebAssembly (WASM) engines, it ensures your documents never leave your device, providing world-class security and speed.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
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
cd nexo-pdf

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

