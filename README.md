# FolioForge

> Authenticity-first PDF workspace. Upload, edit, and detect AI-generated or manipulated content — with a Trust Score and on-page overlay boxes.

This is the team monorepo for the 4–5 day prototype sprint. The build plan is in
[`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) — please skim it before you start, especially **Section 5 (The Contract)**.

## Repo layout

```
folioForge/
├── frontend/   ← React + Vite + PDF.js   (Sharav)   — port 5173
├── gateway/    ← Node + Express + SQLite (Siddharth) — port 3000
└── pyservice/  ← FastAPI (PDF + scan)    (Srestha + Divya) — port 8000
```

Each folder has its own `README.md` with one start command. You should be able to
run the whole prototype with **three terminals, three commands**.

## The one flow that must work (demo path)

> Log in → upload a PDF (one real photo + one AI image) → merge with a second
> file → add a highlight → **Check Authenticity** → AI image is flagged with a
> box and a Trust Score appears → download the result.

If that sequence runs without errors, the prototype is a success.

## Owners

| Part                 | Owner     | What it does                                    |
| -------------------- | --------- | ----------------------------------------------- |
| `frontend/`          | Sharav    | All UI; PDF viewer; authenticity overlay        |
| `gateway/`           | Siddharth | API gateway; SQLite metadata; file storage      |
| `pyservice/pdf/`     | Srestha   | merge / compress / split / extract              |
| `pyservice/scan/`    | Divya     | image extraction + detection model + scoring    |

## Frozen contract (Section 5 of the build plan)

All four lanes build against this set of message shapes. **Do not silently
change a field name.** A copy of the frozen contract is mirrored at
[`docs/CONTRACT.md`](docs/CONTRACT.md) for quick reference.

Key shapes:

```
POST /api/upload        →  { fileId, filename, pageCount }
POST /api/merge         →  { fileId }
POST /api/scan          →  ScanResult (see below)
```

```json
ScanResult = {
  "trustScore": 0–100,
  "modelVersion": "v0",
  "elements": [
    {
      "type": "image",
      "page": 1,
      "bbox": [x, y, w, h],   // each in 0–1, top-left origin
      "classification": "authentic | synthetic | manipulated | inconclusive",
      "confidence": 0–1
    }
  ]
}
```

## Running locally

```bash
# terminal 1 — frontend (port 5173)
cd frontend && npm install && npm run dev

# terminal 2 — gateway (port 3000)         [Siddharth]
cd gateway   && npm install && npm run dev

# terminal 3 — python service (port 8000)  [Srestha + Divya]
cd pyservice && uv pip install -r requirements.txt && uvicorn app:app --reload
```

The frontend can also run standalone in **stub mode** without the gateway —
useful for UI work while the backend is in flight. See
[`frontend/README.md`](frontend/README.md).

## Day-by-day

See [`docs/BUILD_PLAN.md` §8](docs/BUILD_PLAN.md). Day 3 is the integration day.
Days 4–5 are buffer.

## Definition of done

- [ ] A user can log in
- [ ] A user can upload a PDF and see it
- [ ] Merge / compress produces a correct new file that downloads
- [ ] One annotation can be added
- [ ] "Check Authenticity" returns a Trust Score
- [ ] Suspect images are boxed correctly on the page, with confidence on hover
- [ ] The full demo flow runs without a crash, twice in a row
- [ ] Each folder's README explains how to start it
