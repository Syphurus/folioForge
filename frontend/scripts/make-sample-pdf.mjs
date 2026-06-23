// Generates the sample PDF that powers stub-mode rendering.
// Run with: node scripts/make-sample-pdf.mjs
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { writeFileSync } from 'node:fs';

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const pages = [
  { title: 'Quarterly Report — Cover', body: 'FolioForge demo document.\nUploaded for authenticity scanning.' },
  { title: 'Field Photos', body: 'Two embedded images.\nOne authentic, one AI-generated.' },
  { title: 'Appendix', body: 'Charts and signatures.\nFor verification testing.' },
];

for (const p of pages) {
  const page = doc.addPage([612, 792]);
  page.drawRectangle({ x: 0, y: 720, width: 612, height: 72, color: rgb(0.94, 0.95, 0.98) });
  page.drawText('FolioForge', { x: 40, y: 750, size: 11, font: bold, color: rgb(0.25, 0.27, 0.4) });
  page.drawText(p.title, { x: 40, y: 690, size: 22, font: bold, color: rgb(0.1, 0.12, 0.2) });
  const lines = p.body.split('\n');
  lines.forEach((line, i) => {
    page.drawText(line, { x: 40, y: 640 - i * 18, size: 12, font, color: rgb(0.2, 0.22, 0.3) });
  });

  // Two placeholder image rectangles that align with the sample Scan Result bboxes:
  // bbox [0.12, 0.30, 0.25, 0.18] and [0.55, 0.62, 0.20, 0.15] (0–1, top-left origin).
  const W = 612, H = 792;
  for (const [x, y, w, h, label] of [
    [0.12, 0.30, 0.25, 0.18, 'photo A'],
    [0.55, 0.62, 0.20, 0.15, 'photo B'],
  ]) {
    const left = x * W;
    const top = y * H;
    const wpx = w * W, hpx = h * H;
    const bottom = H - top - hpx;
    page.drawRectangle({ x: left, y: bottom, width: wpx, height: hpx, color: rgb(0.86, 0.88, 0.93), borderColor: rgb(0.6, 0.65, 0.75), borderWidth: 1 });
    page.drawText(label, { x: left + 6, y: bottom + hpx - 14, size: 9, font, color: rgb(0.4, 0.45, 0.55) });
  }

  page.drawText(`Page ${pages.indexOf(p) + 1} of ${pages.length}`, {
    x: 40, y: 30, size: 9, font, color: rgb(0.5, 0.55, 0.65),
  });
}

const bytes = await doc.save();
writeFileSync(new URL('../src/assets/sample.pdf', import.meta.url), bytes);
console.log(`Wrote sample.pdf (${bytes.length} bytes, ${pages.length} pages)`);
