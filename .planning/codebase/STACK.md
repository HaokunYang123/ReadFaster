# Technology Stack

**Analysis Date:** 2026-01-26

## Languages

**Primary:**
- TypeScript 5.3.0 - All source code uses TypeScript for type safety

**Secondary:**
- JavaScript (via Node/React)

## Runtime

**Environment:**
- Node.js (version defined by package manager lockfile)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 14.2.0 - Full-stack React framework with server/client components, API routes, and built-in optimization

**Frontend:**
- React 18.2.0 - UI component library
- React DOM 18.2.0 - React rendering for web

**Testing:**
- Not configured in current stack

**Build/Dev:**
- Next.js build system (via `next build`, `next dev`)
- Tailwind CSS 3.4.1 - Utility-first CSS framework
- PostCSS 8.4.35 - CSS processing and plugin system
- Autoprefixer 10.4.17 - Automatic vendor prefixing for CSS

## Key Dependencies

**Critical:**
- tesseract.js 7.0.0 - OCR (Optical Character Recognition) for extracting text from images and scanned PDFs
- pdfjs-dist 5.4.530 - PDF parsing and text extraction from PDF documents
- jszip 3.10.1 - JavaScript ZIP file processing for ePub format support

**Infrastructure:**
- next/server - Next.js server utilities and middleware
- next/font - Google Fonts integration

## Configuration

**Environment:**
- No `.env` files configured
- No environment variables required for basic functionality
- Configuration is primarily built into the application code

**Build:**
- `next.config.js` - Minimal Next.js configuration with `reactStrictMode: true`
- `tsconfig.json` - TypeScript compilation settings with:
  - Path aliases: `@/*` maps to `./src/*`
  - Strict mode enabled
  - Module resolution: bundler
  - JSX preservation for Next.js
- `tailwind.config.ts - Tailwind CSS configuration with:
  - Custom color scheme (primary: #e94560, dark theme colors)
  - Monospace font family extension
  - Content scanning for `src/app/**` and `src/components/**`
- `postcss.config.js` - PostCSS configuration with Tailwind and Autoprefixer plugins
- `.eslintrc.json` - ESLint extends "next/core-web-vitals" rules

## Platform Requirements

**Development:**
- Node.js runtime
- npm package manager
- TypeScript support (provided by Next.js)
- Modern browser with HTML5 support (FileReader API, localStorage, canvas, Web Workers for OCR)

**Production:**
- Node.js server for Next.js runtime
- Web browser capable of running:
  - Modern JavaScript (ES2020+)
  - Canvas API (for PDF OCR rendering)
  - Web Workers (for Tesseract.js)
  - localStorage API (for client-side data persistence)
  - File API (FileReader)
  - Fetch API

---

*Stack analysis: 2026-01-26*
