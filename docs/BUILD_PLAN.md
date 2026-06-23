# FolioForge · Prototype Build Plan

> 4–5 day working-prototype sprint. A thin end-to-end slice that proves the
> idea · upload, edit, and detect fakes.

**Team:** Sharav (Frontend) · Siddharth (Backend) · Srestha (PDF) · Divya (Detection)
**Goal:** a demoable prototype to take forward for review & improvements.

---

## 1. What we are building

A small but complete web app where a user can upload a PDF, perform a few basic operations on it, and · the key part · press **Check Authenticity** to find AI-generated or manipulated content. The result shows a **Trust Score** and draws boxes around suspect parts of the page.

We are **not** building the full SRS. We are building one path that works start to finish, so the concept is real and visible. Everything not needed for that path is deliberately left out.

### In scope vs. out of scope

| In scope (build this)                                  | Out of scope (skip for now)              |
| ------------------------------------------------------ | ---------------------------------------- |
| Single workspace (no multi-tenant)                     | Schema-per-tenant, RBAC, MFA             |
| Simple login (one token)                               | S3 / MinIO, BullMQ queue, Kubernetes     |
| Upload PDF (single + a few files)                      | OCR, format conversion, e-signature      |
| 2–3 PDF operations (merge, compress, split)            | Certificates, batch scan, version diff   |
| One annotation (highlight or text)                     | Recycle bin, quotas, billing             |
| Download the result                                    | Full test coverage & CI gates            |
| Authenticity scan + Trust Score + overlay boxes        |                                          |
| Local disk storage + SQLite                            |                                          |

**Rule of thumb:** if it does not appear in the demo flow (§2), it does not get built this sprint.

---

## 2. The one flow that must work

> Log in → upload a PDF (with one real photo + one AI-made image) → merge with a
> second file → add a highlight → press **Check Authenticity** → app flags the
> AI image with a box and shows the Trust Score → download the result.

If this runs without errors, the prototype is a success.

---

## 3. How it fits together

Three moving parts. The frontend talks **only** to the gateway. The gateway is the single middleman that talks to the Python service.

```
Frontend (React + PDF.js)  ⇄  Gateway (Node + Express, SQLite, local files)  ⇄  Python Service (FastAPI)
```

The Python service has two modules in one app: `/pdf/*` (PDF operations) and `/scan` (detection).

| Part                 | Owner     | Job in one line                                                |
| -------------------- | --------- | -------------------------------------------------------------- |
| Frontend             | Sharav    | The screens the user sees; draws the overlay boxes.            |
| Gateway (Backend)    | Siddharth | Catches requests, stores files, calls Python, returns results. |
| Python · PDF         | Srestha   | Merge / compress / split a PDF and return the new file.        |
| Python · Detection   | Divya     | Look inside the PDF and report what is fake, with confidence. |

---

## 4. Shared setup (Day 1, morning)

| Item       | Decision                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| Repository | One repo, three folders: `/frontend` · `/gateway` · `/pyservice`                  |
| Branches   | One branch per person; merge into `main` via small PRs. Never push broken code.   |
| Ports      | Frontend `5173` · Gateway `3000` · Python `8000`                                  |
| Storage    | Files saved to local `/gateway/uploads/`; metadata in a local SQLite file.        |
| Run        | Each folder has one start command in its README. Three terminals, three commands.|
| Contract   | §5 is frozen on Day 1. If it must change, tell the group first.                   |

---

## 5. The contract

See [CONTRACT.md](CONTRACT.md). Frozen on Day 1.

---

## 6. How we work in parallel

The trick that removes all blocking: **everyone builds against fake data first.**

- **Day 1 stubs.** The Gateway returns hard-coded sample responses (from §5) before Python is ready. The Python `/scan` returns a fixed sample Scan Result before the real model is ready.
- Because of this: the Frontend can build the whole screen · including overlay boxes and Trust Score · on Day 1, using the sample. The Gateway can be wired up without Python. Detection can be perfected separately and swapped in later.
- **The swap.** Around Day 3, real code replaces the stubs one by one. Nothing in the screens changes, because the message shapes never changed.

**Golden rule:** never block on someone else's real code. If they are not ready, use the stub and keep moving.

| Integration point         | Stub owner (Day 1)                       | Real owner (by Day 3)    |
| ------------------------- | ---------------------------------------- | ------------------------ |
| Scan Result shape         | Divya provides sample JSON to everyone   | Divya (real model)       |
| PDF operation responses   | Siddharth hard-codes a returned `fileId` | Srestha (real pypdf)     |
| Gateway endpoints         | Siddharth (returns samples)              | Siddharth (calls Python) |

---

## 7. Each person's part

### 7.1 Frontend · Sharav

**Mission:** build everything the user sees and clicks, and draw the authenticity overlay. The face of the demo.

**Builds:**
- Login screen (sends username/password, stores the token).
- Upload area with drag-and-drop; list of uploaded files.
- PDF viewer using PDF.js; page thumbnails.
- Buttons for Merge, Compress, Split; Download button.
- One annotation tool (highlight).
- The authenticity panel: a **Check Authenticity** button, the Trust Score display, and colored boxes drawn over suspect regions (each `bbox` × the rendered page size). Hover a box to show confidence.

**Depends on:** the contract in §5.1 and the sample Scan Result in §5.3.
**Provides:** the working UI everyone demos through.

### 7.2 Backend / Gateway · Siddharth

**Mission:** the single middleman. Catch every request, store files, call Python, return clean results.

**Builds:**
- Express server with all `/api/*` endpoints from §5.1.
- File upload to `/uploads/`; metadata in SQLite (`fileId`, `filename`, `pageCount`).
- Simple login that returns a token; check the token on protected routes.
- For merge/compress/split/scan: look up file path(s), call the matching Python endpoint (§5.2), save any returned file, return the new `fileId` or the Scan Result.
- Day 1 stubs so the frontend is unblocked before Python exists.

### 7.3 Python · PDF Operations · Srestha

**Mission:** do the real work on the PDF. Given a file, return a correctly changed file.

**Builds (FastAPI routes in the shared Python app):**
- `POST /pdf/merge` · combine files (`pypdf` / `pikepdf`).
- `POST /pdf/compress` · reduce size.
- `POST /pdf/split` · split by page ranges, return the new file paths.

Each route reads from a path, writes a new file, returns its `outputPath`.

### 7.4 Python · Detection · Divya

**Mission:** the star feature. Decide what is AI-made or manipulated, return the score and the boxes.

**Builds (FastAPI route in the shared Python app):**
- **Day 1, first thing:** a `POST /scan` stub that returns the sample Scan Result (§5.3). Share that exact JSON with the team · it unblocks Sharav and Siddharth.
- Extract embedded images and their page positions (e.g. `PyMuPDF` / `fitz`). Convert each rectangle to a normalized `bbox` by dividing by page width/height → `0–1`.
- Run the detection model on each image → `classification` + `confidence`.
- Aggregate into a `0–100` `trustScore`.
- Return the real Scan Result in the **exact** shape of the stub.

---

## 8. Day-by-day master timeline

| Day | Sharav · Frontend                       | Siddharth · Gateway                       | Srestha · PDF                          | Divya · Detection                                      |
| --- | --------------------------------------- | ----------------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| 1   | Scaffold; render uploaded PDF           | Server + upload + SQLite + login + stubs | FastAPI app; merge + compress         | `/scan` stub + share sample JSON; image extraction     |
| 2   | Op buttons + one annotation + download  | Wire endpoints to Python PDF ops          | Add split + extract; expose routes    | Real model on images → class + confidence + bbox + score |
| 3   | Integrate: real Gateway + real overlay  | Connect scan; fix contract mismatches     | Match Gateway's payloads; bug-fix     | Swap stub → real `/scan`; verify boxes align          |
| 4   | Polish overlay, loading/error, login    | Authenticity report + full end-to-end run | Buffer / bug-fix                      | Accuracy check / buffer                                |
| 5   | Buffer + demo prep                      | Buffer + demo prep                        | Buffer + demo prep                    | Buffer + demo prep                                     |

Day 3 is the danger day · three lanes meet. That is why Days 4–5 are buffer, not new features. If something slips, **drop a feature, never the core flow.**

---

## 9. Definition of done

- [ ] A user can log in.
- [ ] A user can upload a PDF and see it on screen.
- [ ] Merge (or compress) produces a correct new file that downloads.
- [ ] One annotation can be added.
- [ ] **Check Authenticity** returns a Trust Score.
- [ ] Suspect images are boxed correctly on the page, with confidence on hover.
- [ ] The full §2 flow runs without a crash, twice in a row.
- [ ] README explains how to start all three parts.

---

## 10. Rules that keep us fast

| Rule                                                              | Why                                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------------- |
| The contract (§5) is frozen. Changes are announced first.         | One silent field change breaks two other lanes.                 |
| Never wait on someone's real code · use their stub.               | Keeps all four working at full speed in parallel.               |
| Small, frequent merges into `main`; never push broken code.       | Integration stays cheap.                                        |
| Each person owns their lane fully; ask only at the seams.         | Maximum autonomy, minimum meetings.                             |
| Two short syncs a day (morning plan, evening status).             | Catch mismatches early.                                         |
| When time is short, cut a feature · never the core flow.          | A complete small demo beats a broken big one.                   |
