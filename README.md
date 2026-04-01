# SVG Studio

A fast, modern web app for optimizing SVG files. Powered by [SVGO v4](https://svgo.dev/), running entirely in the browser.

## Features

- **Upload** via drag & drop, file picker, or paste (Ctrl+V / Cmd+V)
- **43 optimization options** with individual toggles, grouped by category
- **Live preview** with split view: code and visual side by side, resizable panels
- **Size comparison** showing original vs. optimized file size with percentage savings
- **Multiple export formats**: SVG download, SVG code, Data URL, CSS `background-image`, CSS `mask-image`, CSS `list-style-image`
- **Theme support**: system preference, light, and dark mode
- **Client-side only**: no server, no uploads - everything runs in a Web Worker in your browser

## Tech Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [SVGO v4](https://svgo.dev/) in a Web Worker

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is output to `dist/`.

## License

MIT
