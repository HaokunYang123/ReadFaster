# External Integrations

**Analysis Date:** 2026-01-26

## APIs & External Services

**URL Fetching:**
- Native Fetch API - Used in `src/app/api/fetch-url/route.ts` to fetch and parse web content
  - SDK/Client: Browser Fetch API (built-in)
  - Auth: None
  - Purpose: Extracts text content from URLs by fetching HTML and parsing with custom extraction logic

**Content Distribution Network:**
- Cloudflare CDN - Used for hosting pdf.js worker script
  - URL: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/[version]/pdf.worker.min.js`
  - Purpose: Provides the web worker script required by pdfjs-dist for PDF processing

## Data Storage

**Databases:**
- None configured

**File Storage:**
- Local filesystem only (browser localStorage and client-side file processing)
  - Client-side storage: localStorage in `src/utils/storage.ts`
  - File types supported: TXT, MD, PDF, ePub, PNG, JPG, JPEG, WEBP, GIF, BMP

**Caching:**
- Browser localStorage - Client-side data persistence
  - Keys: `readfaster_session`, `readfaster_library`, `readfaster_settings`
  - Location: `src/utils/storage.ts`

## Authentication & Identity

**Auth Provider:**
- Custom - None configured
- No authentication system implemented
- Application is client-side only with no user accounts

## Monitoring & Observability

**Error Tracking:**
- None - Errors logged to browser console via `console.error()`

**Logs:**
- Browser console only
  - Storage errors: `src/utils/storage.ts`
  - File/URL fetch errors: `src/components/FileInput.tsx`, `src/app/api/fetch-url/route.ts`
  - RSVP state errors: implicit in hook logic

## CI/CD & Deployment

**Hosting:**
- Not configured (expected to be deployed to Vercel or compatible Node.js hosting)

**CI Pipeline:**
- Not configured

## Environment Configuration

**Required env vars:**
- None - Application has no external service dependencies requiring configuration

**Secrets location:**
- Not applicable - No secrets or sensitive credentials needed

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## OCR & Document Processing

**Tesseract.js Integration:**
- Package: tesseract.js 7.0.0
- Purpose: OCR (Optical Character Recognition) for:
  - Direct image file processing: `src/components/FileInput.tsx` (lines 78-92)
  - Fallback OCR for scanned PDFs: `src/components/FileInput.tsx` (lines 134-180)
  - Language: English ('eng')
  - Web Worker: Uses inline Tesseract.js web worker for browser-based processing
  - Progress tracking: Provides progress callbacks for UI status updates
  - Performance: Limited to 20 pages max for PDF OCR to avoid browser performance issues

**PDF Processing:**
- Package: pdfjs-dist 5.4.530
- Purpose: PDF text extraction and rendering
  - Text extraction: `src/components/FileInput.tsx` (lines 94-132)
  - Canvas rendering: Required for OCR of scanned PDFs
  - Worker script: Loaded from Cloudflare CDN
  - Pages: Supports unlimited for text extraction, limited to 20 for OCR processing

**ePub Processing:**
- Package: jszip 3.10.1
- Purpose: ZIP file decompression and ePub content extraction
  - Location: `src/components/FileInput.tsx` (lines 182-220)
  - Extracts `.xhtml` and `.html` files from ePub archives
  - Filters out table of contents files
  - HTML entity decoding built-in

---

*Integration audit: 2026-01-26*
