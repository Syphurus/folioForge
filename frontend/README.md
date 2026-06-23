# FolioForge · Frontend

Owner: **Sharav**. The screens the user sees and clicks, plus the authenticity overlay.

Stack: **React 18 + Vite 5 + PDF.js**. Plain CSS (no framework) so the design system is one file you can edit.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

That's it. The app boots in **stub mode** by default, so you can demo the whole flow without the gateway or Python service running.

## Stub mode vs real backend

The frontend talks to the gateway via the API client at [`src/api/client.js`](src/api/client.js). When stubs are on (the default), every call returns a hard-coded response shaped exactly like the frozen contract in [`../docs/CONTRACT.md`](../docs/CONTRACT.md). Switch to the real gateway by creating `.env.local`:

```bash
VITE_USE_STUBS=false
VITE_GATEWAY_URL=http://localhost:3000
```

Restart `npm run dev` after changing env. Nothing else in the UI changes · the message shapes are the same in both modes.

## What's inside

```
src/
├── api/client.js              ← gateway calls + stub mode (single source of truth)
├── pdf/pdfjs.js               ← PDF.js worker setup (imported once)
├── components/
│   ├── Login.jsx              ← simple login → stores token in localStorage
│   ├── Upload.jsx             ← drag-and-drop + click-to-browse
│   ├── FileList.jsx           ← uploaded files list, with selection
│   ├── Toolbar.jsx            ← merge / compress / split / highlight / download
│   ├── PdfViewer.jsx          ← PDF.js viewer + thumbnails + overlay boxes
│   └── AuthenticityPanel.jsx  ← Trust Score + per-element list
├── styles/                    ← global.css + app.css (no Tailwind, just CSS vars)
├── assets/sample.pdf          ← 3-page demo PDF for stub mode
└── App.jsx                    ← composes everything
```

## The overlay math (important)

Boxes come back from `/api/scan` as normalized `bbox = [x, y, w, h]` where each value is between 0 and 1 (a fraction of the rendered page, top-left origin). The viewer renders each PDF page into a `<canvas>` inside a `position: relative` frame, then absolutely positions each `<div>` overlay using percentages · boxes stay aligned at any zoom level, with zero pixel math.

The overlay color is driven entirely by `classification`:

| Classification | Color  | Meaning              |
| -------------- | ------ | -------------------- |
| `synthetic`    | red    | AI-generated         |
| `manipulated`  | orange | Edited / tampered    |
| `authentic`    | green  | Genuine              |
| `inconclusive` | grey   | Model couldn't tell  |

Hover any box to see its confidence (`overlay-tip` in `app.css`).

## Highlight tool

Click the **Highlight** button in the toolbar to toggle "draw mode". Click-and-drag on the page to draw a yellow highlight. Highlights are normalized the same way as scan boxes (0–1 of the page) so they survive zoom and re-render.

## Scripts

```bash
npm run dev        # vite dev server
npm run build      # production build
npm run preview    # serve the production build
npm run sample     # regenerate src/assets/sample.pdf
```

## Day-by-day (Sharav's lane)

- **Day 1** · scaffold + render an uploaded PDF
- **Day 2** · operation buttons + one annotation + download
- **Day 3** · wire to real Gateway + draw real overlay
- **Day 4** · polish overlay, loading/error states, login screen
- **Day 5** · buffer + demo prep

## Editing notes for the team

- **Don't change the contract** in `src/api/client.js` without telling the group · Siddharth and Divya are building against it.
- **Don't import directly from `pdfjs-dist`** · use `src/pdf/pdfjs.js` so the worker is configured once.
- **Theme** lives in `src/styles/global.css` (CSS variables at `:root`). Change the brand gradient and the whole app re-themes.
- **No global state lib.** The whole app is React state in `App.jsx`.
