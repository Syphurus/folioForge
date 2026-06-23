import { useEffect, useMemo, useRef, useState } from 'react';
import { pdfjsLib } from '../pdf/pdfjs.js';

// PDF.js renders each page to a <canvas>. We overlay normalized bboxes from the
// Scan Result on top of each page-frame (bbox values are 0–1, multiplied by the
// rendered canvas size). The viewer also supports a single highlight annotation
// drawn by click-drag while the highlight tool is active.

export default function PdfViewer({ pdfUrl, scanResult, highlightMode, onHighlightAdded }) {
  const [doc, setDoc] = useState(null);
  const [pages, setPages] = useState([]); // [{ width, height, viewport }]
  const [activePage, setActivePage] = useState(1);
  const [highlights, setHighlights] = useState({}); // { [page]: [bbox] }

  const containerRef = useRef(null);
  const pageRefs = useRef({}); // page → DOM frame
  const renderTokens = useRef(0);

  // Load the PDF whenever the URL changes.
  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;
    setPages([]);
    setDoc(null);
    setHighlights({});
    setActivePage(1);
    (async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      if (cancelled) return;
      const desc = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        desc.push({ width: viewport.width, height: viewport.height });
      }
      if (cancelled) return;
      setDoc(pdf);
      setPages(desc);
    })().catch((e) => console.error('PDF load failed', e));
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Group scan elements by page for fast overlay lookup.
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

  // Render each visible page canvas (re-render on doc/page-size change).
  useEffect(() => {
    if (!doc || pages.length === 0) return;
    const token = ++renderTokens.current;
    pages.forEach(async (_, idx) => {
      const pageNum = idx + 1;
      const canvas = document.querySelector(`canvas[data-page="${pageNum}"]`);
      if (!canvas) return;
      const page = await doc.getPage(pageNum);
      const containerWidth = containerRef.current?.clientWidth || 800;
      const targetWidth = Math.min(900, containerWidth - 40);
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
  }, [doc, pages]);

  // Drawing a highlight by click-drag inside a page frame.
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
      const bbox = [Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)];
      setHighlights((h) => ({ ...h, [pageNum]: [...((h[pageNum] || []).filter((b) => b.draft !== true)), Object.assign(bbox, { draft: true })] }));
    }
    function up(ev) {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      const x1 = (ev.clientX - rect.left) / rect.width;
      const y1 = (ev.clientY - rect.top) / rect.height;
      const bbox = [Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)];
      if (bbox[2] < 0.01 || bbox[3] < 0.01) {
        setHighlights((h) => ({ ...h, [pageNum]: (h[pageNum] || []).filter((b) => b.draft !== true) }));
        return;
      }
      setHighlights((h) => {
        const cleaned = (h[pageNum] || []).filter((b) => b.draft !== true);
        return { ...h, [pageNum]: [...cleaned, bbox] };
      });
      onHighlightAdded?.({ page: pageNum, bbox });
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
      {/* Thumbnails */}
      <div className="thumbs">
        {pages.map((p, idx) => {
          const pageNum = idx + 1;
          return (
            <Thumbnail
              key={pageNum}
              doc={doc}
              pageNum={pageNum}
              active={activePage === pageNum}
              onClick={() => {
                setActivePage(pageNum);
                const el = pageRefs.current[pageNum];
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          );
        })}
      </div>

      {/* Pages */}
      <div className="canvas-wrap" ref={containerRef}>
        {pages.map((p, idx) => {
          const pageNum = idx + 1;
          const containerWidth = containerRef.current?.clientWidth || 800;
          const targetWidth = Math.min(900, containerWidth - 40);
          const scale = targetWidth / (p.width || 800);
          const w = (p.width || 800) * scale;
          const h = (p.height || 1100) * scale;
          const elems = elementsByPage.get(pageNum) || [];
          const hl = highlights[pageNum] || [];
          return (
            <div
              key={pageNum}
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
                  style={{
                    left: `${b[0] * 100}%`,
                    top: `${b[1] * 100}%`,
                    width: `${b[2] * 100}%`,
                    height: `${b[3] * 100}%`,
                  }}
                />
              ))}
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
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${w * 100}%`,
        height: `${h * 100}%`,
      }}
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

function Thumbnail({ doc, pageNum, active, onClick }) {
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
    <div className={`thumb${active ? ' active' : ''}`} onClick={onClick}>
      <span className="num">{pageNum}</span>
      <canvas ref={ref} />
    </div>
  );
}
