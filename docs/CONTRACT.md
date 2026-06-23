# The Contract (Section 5 · Frozen Day 1)

Mirrors §5 of the [build plan](BUILD_PLAN.md). This is the set of messages each part sends the other. **Frozen** · do not change a field name without telling the group first.

## 5.1 Frontend → Gateway

| Action     | Call                              | Sends                            | Gets back                                |
| ---------- | --------------------------------- | -------------------------------- | ---------------------------------------- |
| Login      | `POST /api/login`                 | `{ username, password }`         | `{ token }`                              |
| Upload     | `POST /api/upload`                | file(s) (form-data)              | `{ fileId, filename, pageCount }`        |
| List files | `GET  /api/files`                 |  | `[ { fileId, filename, pageCount } ]`    |
| Get PDF    | `GET  /api/files/:id/raw`         |  | the PDF bytes (for PDF.js)               |
| Merge      | `POST /api/merge`                 | `{ fileIds:[...] }`              | `{ fileId }`                             |
| Compress   | `POST /api/compress`              | `{ fileId }`                     | `{ fileId }`                             |
| Split      | `POST /api/split`                 | `{ fileId, ranges:["1-3"] }`     | `{ fileIds:[...] }`                      |
| Scan       | `POST /api/scan`                  | `{ fileId }`                     | Scan Result (5.3)                        |

Protected routes expect `Authorization: Bearer <token>`.

## 5.2 Gateway → Python (internal)

| Call                       | Sends                          | Gets back                |
| -------------------------- | ------------------------------ | ------------------------ |
| `POST /pdf/merge`          | `{ paths:[...] }`              | `{ outputPath }`         |
| `POST /pdf/compress`       | `{ path }`                     | `{ outputPath }`         |
| `POST /pdf/split`          | `{ path, ranges:[...] }`       | `{ outputPaths:[...] }`  |
| `POST /scan`               | `{ path }`                     | Scan Result (5.3)        |

## 5.3 The Scan Result

Boxes use **normalized coordinates from 0 to 1** · a fraction of the page, not pixels. This is what lets the overlay line up at any zoom level. `bbox = [x, y, width, height]`, each in `[0, 1]`, measured from the **top-left** of the page.

```json
{
  "trustScore": 38,
  "modelVersion": "v0",
  "elements": [
    {
      "type": "image",
      "page": 1,
      "bbox": [0.12, 0.30, 0.25, 0.18],
      "classification": "synthetic",
      "confidence": 0.94
    },
    {
      "type": "image",
      "page": 1,
      "bbox": [0.55, 0.62, 0.20, 0.15],
      "classification": "authentic",
      "confidence": 0.88
    }
  ]
}
```

- `classification` is one of: `authentic`, `synthetic`, `manipulated`, `inconclusive`.
- `confidence` is `0–1`.
- `trustScore` is `0–100` (higher = more trustworthy).

The frontend ships this exact JSON as the stub response from `POST /api/scan` until Divya's real `/scan` is wired in · see `frontend/src/api/client.js`.
