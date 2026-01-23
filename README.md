# ReadFaster - RSVP Speed Reader

> This is for me to read faster.

A Rapid Serial Visual Presentation (RSVP) speed reading application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **RSVP Technology**: Display one word at a time for faster reading
- **ORP Algorithm**: Optimal Recognition Point highlighting (red pivot letter)
- **Speed Control**: Adjustable WPM from 100 to 1000 words per minute
- **Auto-rewind**: Automatically rewinds 5 words when paused for context recovery
- **Progress Tracking**: Visual progress bar and word counter

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm run start
```

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy automatically

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/readfaster)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind and custom styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/
│   ├── Controls.tsx     # Playback controls
│   ├── Instructions.tsx # Usage instructions
│   ├── ReaderDisplay.tsx# RSVP display area
│   ├── TextInput.tsx    # Text input area
│   └── WordDisplay.tsx  # Word with ORP highlighting
├── hooks/
│   └── useRSVP.ts       # RSVP state management
├── types/
│   └── index.ts         # TypeScript types
└── utils/
    └── rsvp.ts          # RSVP utility functions
```

## License

MIT
