import { useEffect, useMemo, useRef, useState } from 'react';
import { pdfjsLib } from '../pdf/pdfjs.js';

export default function PdfViewer({
  pdfUrl,
  scanResult,
  highlightMode,
  zoom = 1,
  highlights = {},
  onHighlightAdd,
  onDocLoad,
  onActivePageChange,
}) {
  const [doc, setDoc] = useState(null);
  const [pages, setPages] = useState([]); // [{ width, height }]
  const [draft, setDraft] = useState(null); // { page, bbox } — transient while dragging

  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const renderTokens = useRef(0);

  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;
    setPages([]); setDoc(null); setDraft(null);
    (async () => {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      if (cancelled) return;
      const desc = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        desc.push({ width: vp.width, height: vp.height });
      }
      if (cancelled) return;
      setDoc(pdf);
      setPages(desc);
      onDocLoad?.({ pageCount: pdf.numPages });
    })().catch((e) => console.error('PDF load failed', e));
    return () => { cancelled = true; };
  }, [pdfUrl]); // eslint-disable-line

  const elementsByPage = useMemo(() => {
    const m = new Map();
    if (!scanResult?.elements) return m;
    for (const el of scanResult.elements) {
      const arr = m.get(el.page) || [];
      arr.push(el);
      m.set(el.page, arr);
    }
    return m;
  }, [scanResult]);

  // Render each page canvas whenever doc, page list, or zoom changes.
  useEffect(() => {
    if (!doc || pages.length === 0) return;
    const token = ++renderTokens.current;
    pages.forEach(async (_, idx) => {
      const pageNum = idx + 1;
      const canvas = document.querySelector(`canvas[data-page="${pageNum}"]`);
      if (!canvas) return;
      const page = await doc.getPage(pageNum);
      const containerWidth = containerRef.current?.clientWidth || 800;
      const targetWidth = Math.min(900, containerWidth - 40) * zoom;
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (token !== renderTokens.current) return;
      await page.render({ canvasContext: ctx, viewport }).promise;
    });
  }, [doc, pages, zoom]);

  // Track which page is most visible for the status bar.
  useEffect(() => {
    if (!onActivePageChange || pages.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      const top = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (top) {
        const n = Number(top.target.getAttribute('data-page'));
        if (n) onActivePageChange(n);
      }
    }, { root: containerRef.current, threshold: [0.1, 0.5, 0.9] });
    Object.values(pageRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [pages, onActivePageChange]);

  function startHighlightDraw(pageNum, e) {
    if (!highlightMode) return;
    const frame = pageRefs.current[pageNum];
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x0 = (e.clientX - rect.left) / rect.width;
    const y0 = (e.clientY - rect.top) / rect.height;

    function move(ev) {
      const x1 = (ev.clientX - rect.left) / rect.width;
      const y1 = (ev.clientY - rect.top) / rect.height;
      setDraft({
        page: pageNum,
        bbox: [Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)],
      });
    }
    function up(ev) {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      const x1 = (ev.clientX - rect.left) / rect.width;
      const y1 = (ev.clientY - rect.top) / rect.height;
      const bbox = [Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)];
      setDraft(null);
      if (bbox[2] < 0.01 || bbox[3] < 0.01) return;
      onHighlightAdd?.({ page: pageNum, bbox });
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  if (!pdfUrl) {
    return (
      <div className="canvas-wrap" style={{ flex: 1 }}>
        <div className="dim">Select a file to view it here.</div>
      </div>
    );
  }

  return (
    <div className="viewer">
      <div className="thumbs">
        {pages.map((p, idx) => {
          const pageNum = idx + 1;
          return (
            <Thumbnail
              key={pageNum}
              doc={doc}
              pageNum={pageNum}
              onClick={() => pageRefs.current[pageNum]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
          );
        })}
      </div>

      <div className="canvas-wrap" ref={containerRef}>
        {pages.map((p, idx) => {
          const pageNum = idx + 1;
          const containerWidth = containerRef.current?.clientWidth || 800;
          const targetWidth = Math.min(900, containerWidth - 40) * zoom;
          const scale = targetWidth / (p.width || 800);
          const w = (p.width || 800) * scale;
          const h = (p.height || 1100) * scale;
          const elems = elementsByPage.get(pageNum) || [];
          const hl = highlights[pageNum] || [];
          const isDrafting = draft?.page === pageNum;
          return (
            <div
              key={pageNum}
              data-page={pageNum}
              ref={(el) => (pageRefs.current[pageNum] = el)}
              className="page-frame"
              style={{ width: w, height: h, cursor: highlightMode ? 'crosshair' : 'default' }}
              onMouseDown={(e) => startHighlightDraw(pageNum, e)}
            >
              <canvas data-page={pageNum} />
              {hl.map((b, i) => (
                <div
                  key={`hl-${i}`}
                  className="highlight"
                  style={{ left: `${b[0] * 100}%`, top: `${b[1] * 100}%`, width: `${b[2] * 100}%`, height: `${b[3] * 100}%` }}
                />
              ))}
              {isDrafting && (
                <div
                  className="highlight draft"
                  style={{ left: `${draft.bbox[0] * 100}%`, top: `${draft.bbox[1] * 100}%`, width: `${draft.bbox[2] * 100}%`, height: `${draft.bbox[3] * 100}%` }}
                />
              )}
              {elems.map((el, i) => (
                <OverlayBox key={`box-${i}`} el={el} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverlayBox({ el }) {
  const [hover, setHover] = useState(false);
  const [x, y, w, h] = el.bbox;
  return (
    <div
      className={`overlay-box ${el.classification}`}
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <div className="overlay-tip">
          {el.classification} · {(el.confidence * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}

function Thumbnail({ doc, pageNum, onClick }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!doc || !ref.current) return;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(pageNum);
      const base = page.getViewport({ scale: 1 });
      const scale = 90 / base.width;
      const viewport = page.getViewport({ scale });
      const c = ref.current;
      if (!c || cancelled) return;
      c.width = viewport.width;
      c.height = viewport.height;
      await page.render({ canvasContext: c.getContext('2d'), viewport }).promise;
    })().catch(() => {});
    return () => { cancelled = true; };
  }, [doc, pageNum]);

  return (
    <div className="thumb" onClick={onClick}>
      <span className="num">{pageNum}</span>
      <canvas ref={ref} />
    </div>
  );
}
