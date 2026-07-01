// FolioForge API client.
// Talks to the Gateway (Section 5.1 of the build plan).
// When VITE_USE_STUBS=true (default), all calls return mock data so the
// frontend runs end-to-end without the Gateway/Python services being up.
import { pdfjsLib } from '../pdf/pdfjs.js';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000';
const SCAN_URL = import.meta.env.VITE_SCAN_URL || 'http://localhost:8000';
const USE_STUBS = (import.meta.env.VITE_USE_STUBS ?? 'true') !== 'false';

const TOKEN_KEY = 'folioforge.token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(extra = {}) {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, ...extra } : extra;
}

async function jsonOrThrow(res) {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${body ? ` · ${body}` : ''}`);
  }
  return res.json();
}

// ───────── Stub state (used when USE_STUBS is on) ─────────
import samplePdfUrl from '../assets/sample.pdf?url';

const stubStore = {
  files: [
    { fileId: 'demo-1', filename: 'sample-document.pdf', pageCount: 3 },
  ],
  nextId: 2,
};

async function fakeLatency(ms = 350) {
  return new Promise((r) => setTimeout(r, ms));
}

// Sample Scan Result from Section 5.3 of the contract.
// Divya provides the real version of this · until then we hard-code it.
const SAMPLE_SCAN_RESULT = {
  trustScore: 38,
  modelVersion: 'v0-stub',
  elements: [
    {
      type: 'image',
      page: 1,
      bbox: [0.12, 0.30, 0.25, 0.18],
      classification: 'synthetic',
      confidence: 0.94,
    },
    {
      type: 'image',
      page: 1,
      bbox: [0.55, 0.62, 0.20, 0.15],
      classification: 'authentic',
      confidence: 0.88,
    },
    {
      type: 'image',
      page: 2,
      bbox: [0.20, 0.20, 0.30, 0.25],
      classification: 'manipulated',
      confidence: 0.71,
    },
  ],
};

// ───────── Public API ─────────

export const api = {
  useStubs: USE_STUBS,

  async login(username, password) {
    if (USE_STUBS) {
      await fakeLatency();
      if (!username || !password) throw new Error('Username and password are required');
      const token = `stub-token-${btoa(username)}`;
      setToken(token);
      return { token };
    }
    const data = await jsonOrThrow(
      await fetch(`${GATEWAY_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
    );
    setToken(data.token);
    return data;
  },

  logout() {
    setToken(null);
  },

  async upload(files) {
    if (USE_STUBS) {
      await fakeLatency(600);
      const created = [];
      for (const f of Array.from(files)) {
        let pageCount = 0;
        try {
          const buf = await f.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
          pageCount = pdf.numPages;
        } catch {
          pageCount = 0; // unreadable — leave 0 so the UI can show "?"
        }
        const fileId = `demo-${stubStore.nextId++}`;
        const entry = { fileId, filename: f.name, pageCount, _blob: f };
        stubStore.files.push(entry);
        created.push(entry);
      }
      return created[0]; // contract: { fileId, filename, pageCount }
    }
    const form = new FormData();
    for (const f of files) form.append('file', f);
    return jsonOrThrow(
      await fetch(`${GATEWAY_URL}/api/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      })
    );
  },

  async listFiles() {
    if (USE_STUBS) {
      await fakeLatency(150);
      return stubStore.files.map(({ fileId, filename, pageCount }) => ({
        fileId,
        filename,
        pageCount,
      }));
    }
    return jsonOrThrow(
      await fetch(`${GATEWAY_URL}/api/files`, { headers: authHeaders() })
    );
  },

  // Return a URL the PDF viewer can load.
  async getPdfUrl(fileId) {
    if (USE_STUBS) {
      const entry = stubStore.files.find((f) => f.fileId === fileId);
      if (entry && entry._blob) return URL.createObjectURL(entry._blob);
      return samplePdfUrl;
    }
    return `${GATEWAY_URL}/api/files/${fileId}/raw`;
  },

  async merge(fileIds) {
    if (USE_STUBS) {
      await fakeLatency(700);
      const fileId = `demo-${stubStore.nextId++}`;
      stubStore.files.push({ fileId, filename: 'merged.pdf', pageCount: 6 });
      return { fileId };
    }
    return jsonOrThrow(
      await fetch(`${GATEWAY_URL}/api/merge`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ fileIds }),
      })
    );
  },

  async compress(fileId) {
    if (USE_STUBS) {
      await fakeLatency(700);
      const id = `demo-${stubStore.nextId++}`;
      stubStore.files.push({ fileId: id, filename: 'compressed.pdf', pageCount: 3 });
      return { fileId: id };
    }
    return jsonOrThrow(
      await fetch(`${GATEWAY_URL}/api/compress`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ fileId }),
      })
    );
  },

  async split(fileId, ranges) {
    if (USE_STUBS) {
      await fakeLatency(700);
      const ids = ranges.map((r, i) => {
        const id = `demo-${stubStore.nextId++}`;
        stubStore.files.push({ fileId: id, filename: `split-${r}.pdf`, pageCount: 1 });
        return id;
      });
      return { fileIds: ids };
    }
    return jsonOrThrow(
      await fetch(`${GATEWAY_URL}/api/split`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ fileId, ranges }),
      })
    );
  },

  async scan(fileId) {
    // Scan always calls the real Python service (Divya's work). Only fall back
    // to the sample result if the scan URL is explicitly disabled.
    if (import.meta.env.VITE_SCAN_URL === 'stub') {
      await fakeLatency(1200);
      return SAMPLE_SCAN_RESULT;
    }
    const pdfUrl = await this.getPdfUrl(fileId);
    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) throw new Error(`Could not load PDF (${pdfRes.status})`);
    const pdfBlob = await pdfRes.blob();

    const form = new FormData();
    form.append('file', pdfBlob, `${fileId}.pdf`);

    return jsonOrThrow(
      await fetch(`${SCAN_URL}/scan`, { method: 'POST', body: form })
    );
  },
};

export { SAMPLE_SCAN_RESULT };
