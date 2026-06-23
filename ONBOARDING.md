# Onboarding · FolioForge prototype sprint

Welcome. This is a 4 to 5 day sprint to build a thin slice of FolioForge that demos end to end: upload a PDF, edit it, run a Check Authenticity scan, see a Trust Score and on-page evidence, download the result.

If something here is unclear, ping the group. The contract in [`docs/CONTRACT.md`](docs/CONTRACT.md) is the only thing that absolutely cannot be changed silently, so read that section first.

---

## 1. Get the code

```bash
git clone git@github.com:Syphurus/folioForge.git
cd folioForge
```

You should have access already. If `git clone` says permission denied, ping Sharav so he can add you as a collaborator on the repo.

The repo is a monorepo with one folder per lane:

```
folioForge/
├── frontend/   React + Vite + PDF.js          (Sharav)     port 5173
├── gateway/    Node + Express + SQLite         (Siddharth)  port 3000
├── pyservice/  FastAPI · /pdf · /scan          (Srestha + Divya) port 8000
└── docs/       build plan, frozen API contract
```

Each lane runs on a different port so all three can run side by side. You only need to touch your own folder, plus the shared docs.

---

## 2. Make sure you have the tools

| You need     | Versions known to work    | Install                                              |
| ------------ | ------------------------- | ---------------------------------------------------- |
| Node         | 20.x or newer (not 18)    | `nvm install 20 && nvm use 20`                       |
| Python       | 3.11 or newer             | from python.org or `pyenv`                           |
| Git          | any recent version        | already on most machines                             |
| GitHub CLI   | optional but handy        | `brew install gh` then `gh auth login`               |

To check: `node -v` should show v20+, `python --version` should show 3.11+.

---

## 3. Run the frontend right now to feel the demo

This works on any machine with Node 20. It uses bundled stub data, no backend.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Sign in with any username and password, then go through the flow: upload, open a document, Check Authenticity, see the Trust Score and overlay boxes. Once you've seen this, you understand what the prototype has to do end to end.

---

## 4. Which lane are you?

Skip to your section.

### 4.1 Sharav · Frontend

You already own this. The full setup is in [`frontend/README.md`](frontend/README.md). Day plan in [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) §7.1.

### 4.2 Siddharth · Gateway

You build the Node + Express server that sits between the frontend and the Python service. Setup:

```bash
cd gateway
npm init -y                    # if you haven't yet
npm install express cors better-sqlite3 multer node-fetch
# pick a router of your choice; the contract is what matters
```

Start with **Day 1 stubs**: hard-code the responses from [`docs/CONTRACT.md`](docs/CONTRACT.md) §5.1. Sharav's frontend can already call you the moment your endpoints exist because the message shapes are frozen.

Your full checklist is in [`gateway/README.md`](gateway/README.md). Day plan in [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) §7.2. Listen on port **3000**.

### 4.3 Srestha · Python · PDF Ops

You build three FastAPI routes that operate on a PDF file path and return a new file path:

```bash
cd pyservice
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn pypdf pikepdf python-multipart
uvicorn app:app --reload --port 8000
```

Routes (in [`docs/CONTRACT.md`](docs/CONTRACT.md) §5.2):

```
POST /pdf/merge      { paths:[...] }            → { outputPath }
POST /pdf/compress   { path }                   → { outputPath }
POST /pdf/split      { path, ranges:[...] }     → { outputPaths:[...] }
```

Day plan in [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) §7.3.

### 4.4 Divya · Python · Detection

You build the star feature. **Day 1 first thing**: stand up a `POST /scan` stub that returns the sample Scan Result from [`docs/CONTRACT.md`](docs/CONTRACT.md) §5.3 verbatim. This unblocks Sharav and Siddharth immediately. Then you swap in the real model.

```bash
cd pyservice
python -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn pymupdf pillow numpy
# plus your detection model's deps
uvicorn app:app --reload --port 8000
```

The route signature:

```
POST /scan           { path }                   → ScanResult
```

ScanResult shape is frozen. Bboxes are normalized 0 to 1 with top-left origin. See [`docs/CONTRACT.md`](docs/CONTRACT.md) §5.3 for the exact JSON. Day plan in [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) §7.4.

You share `pyservice/` with Srestha but own different route files. Mount each module under the FastAPI app:

```python
# pyservice/app.py
from fastapi import FastAPI
from pdf_routes import router as pdf_router   # Srestha
from scan_routes import router as scan_router  # Divya

app = FastAPI()
app.include_router(pdf_router, prefix="/pdf")
app.include_router(scan_router)
```

---

## 5. How we work in the repo

### Branching

One branch per person, named after your lane. Push small commits often.

```bash
git checkout -b sharav/frontend     # or siddharth/gateway, srestha/pdf, divya/scan
```

Never push directly to `main`. Always open a pull request from your branch into `main`.

### Pull requests

Keep PRs small and frequent. A typical PR is a single working slice: one new endpoint, one stub swapped for real code, one UI panel. A PR that touches your folder only is the happy path. A PR that touches `docs/CONTRACT.md` needs a heads-up in the group first.

When opening a PR:

```bash
git push -u origin sharav/frontend
gh pr create --fill
```

Or open it in the GitHub web UI. Sharav reviews frontend PRs, Siddharth reviews gateway PRs, Srestha and Divya cross-review each other's pyservice PRs. Merge once one teammate has approved.

### Commit messages

Short, lowercase, prefixed with your lane:

```
frontend: wire merge button to /api/merge
gateway:  stub /api/scan with sample json
scan:     extract images with pymupdf and return normalized bboxes
pdf:      pypdf merge route, tested on three sample files
```

### Daily syncs

Two short ones per day, as the build plan calls for:

- **Morning** (5 min). What you're trying to land today.
- **Evening** (5 min). What landed, what's blocked, what's tomorrow.

Day 3 is the danger day because three lanes meet. Days 4 and 5 are buffer.

---

## 6. The one rule that keeps us fast

> **Never wait on someone else's real code. Use their stub.**

If your endpoint is not done, return a hard-coded sample response that matches the contract. The frontend should be able to demo the full flow on Day 1 against stubs alone, and that is in fact already true on `main`. Swap stubs for real code lane by lane during Day 3.

If the contract has to change, tell the group first. One silent field rename breaks two other lanes.

---

## 7. Where to find things

| You want                                    | Read this                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| The full sprint plan                        | [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md)                                                 |
| The frozen API contract                     | [`docs/CONTRACT.md`](docs/CONTRACT.md)                                                     |
| What the frontend already does              | [`frontend/README.md`](frontend/README.md)                                                 |
| Gateway checklist                           | [`gateway/README.md`](gateway/README.md)                                                   |
| Python service checklist (PDF + Detection)  | [`pyservice/README.md`](pyservice/README.md)                                               |
| Definition of done (demo checklist)         | [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) §9                                              |

---

## 8. First-day checklist

Run this once you've cloned. If every box ticks, you are unblocked.

- [ ] `node -v` is `v20` or newer.
- [ ] You can run the frontend (`cd frontend && npm install && npm run dev`) and sign in.
- [ ] You've read [`docs/CONTRACT.md`](docs/CONTRACT.md) once, end to end. It is short.
- [ ] You've read your section in [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) §7.
- [ ] You have a branch named after your lane (`git checkout -b yourname/lane`).
- [ ] Your service starts on the right port (gateway 3000, pyservice 8000).
- [ ] You've pushed at least one commit to your branch on GitHub.

Then start shipping. Day 1 stubs first, real code after.
