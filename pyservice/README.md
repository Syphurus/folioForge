# FolioForge — Python Service

Owners: **Srestha** (PDF ops) + **Divya** (detection).

One FastAPI app, two modules: `/pdf/*` and `/scan`. Shared repo, separate route files.

> ⚠️ This folder is a placeholder. Until the real service lands, the gateway
> (Siddharth) returns hard-coded responses that match the contract.

## Quick start (when implemented)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## Routes (from §5.2 of the contract)

### Srestha · PDF operations

```
POST /pdf/merge      { paths:[...] }            → { outputPath }
POST /pdf/compress   { path }                   → { outputPath }
POST /pdf/split      { path, ranges:[...] }     → { outputPaths:[...] }
```

Use `pypdf` / `pikepdf`. Read from `path`, write a new file, return `outputPath`.

### Divya · Detection

```
POST /scan           { path }                   → ScanResult
```

**Day 1 first:** return the sample [`ScanResult`](../docs/CONTRACT.md#53-the-scan-result) as a stub. Share that exact JSON with the team — it unblocks Sharav and Siddharth immediately.

Then:
1. Extract embedded images with their page positions (e.g. `PyMuPDF` / `fitz`).
2. Normalize each rectangle to `bbox = [x, y, w, h]` in `0–1`, **top-left origin**.
3. Run the detection model on each image → `classification` + `confidence`.
4. Aggregate into a `0–100` `trustScore`.
5. Return the real Scan Result in the **exact** shape of the stub.
