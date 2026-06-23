import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';

export default function Landing() {
  return (
    <>
      <Nav />

      {/* ---------- HERO ---------- */}
      <header className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <Reveal>
                <span className="eyebrow">Prototype · Sprint v1.0</span>
              </Reveal>
              <Reveal delay={1} as="h1" className="display">
                Trust, <em>made visible</em>.
              </Reveal>
              <Reveal delay={2}>
                <p className="lede">
                  FolioForge is the authenticity layer for documents. Upload a PDF,
                  edit it, and let the engine flag AI-generated or manipulated content
                  with a Trust Score and on-page evidence.
                </p>
              </Reveal>
              <Reveal delay={3} className="hero-ctas">
                <Link to="/login" className="btn btn-primary btn-lg">Launch the demo →</Link>
                <Link to="/how-it-works" className="btn btn-lg">See how it works</Link>
              </Reveal>
              <Reveal delay={4} className="hero-stats">
                <div className="hero-stat">
                  <span className="num">0–100</span>
                  <span className="label">Trust score</span>
                </div>
                <div className="hero-stat">
                  <span className="num">4</span>
                  <span className="label">Classifications</span>
                </div>
                <div className="hero-stat">
                  <span className="num">5d</span>
                  <span className="label">Sprint to demo</span>
                </div>
              </Reveal>
            </div>

            <Reveal delay={2}>
              <HeroMockup />
            </Reveal>
          </div>

          <div className="trust-strip">
            <span><span className="dot-small" /> React + PDF.js</span>
            <span><span className="dot-small" /> Node · Express · SQLite</span>
            <span><span className="dot-small" /> Python · FastAPI</span>
            <span><span className="dot-small" /> Schema-first contract</span>
          </div>
        </div>
      </header>

      {/* ---------- FEATURES ---------- */}
      <section className="section">
        <div className="container">
          <div className="sec-head">
            <Reveal><span className="eyebrow">What it does</span></Reveal>
            <Reveal delay={1} as="h2" className="display">
              Three lanes. <em>One demo.</em>
            </Reveal>
            <Reveal delay={2}>
              <p className="lede">
                A thin end-to-end slice of the full product. Enough to feel real,
                small enough to ship in a week. Every piece below is in scope this sprint.
              </p>
            </Reveal>
          </div>

          <div className="features">
            <Reveal delay={1} className="feature">
              <div className="icon">⌥</div>
              <h3>Upload & edit</h3>
              <p>Drag-and-drop PDFs, render them with PDF.js, then merge, compress, split, or highlight. Download the result with one click.</p>
            </Reveal>
            <Reveal delay={2} className="feature">
              <div className="icon">⚝</div>
              <h3>Detect what's fake</h3>
              <p>The star feature. Extract every embedded image, classify each as authentic, synthetic, manipulated, or inconclusive, with confidence.</p>
            </Reveal>
            <Reveal delay={3} className="feature">
              <div className="icon">◆</div>
              <h3>Show the evidence</h3>
              <p>A Trust Score from 0 to 100 and color-coded boxes drawn directly over suspect regions of the page. Hover to see confidence.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- THE CONTRACT ---------- */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <Reveal><span className="eyebrow">Frozen Day 1</span></Reveal>
              <Reveal delay={1} as="h2" className="display">
                One <em>contract</em>.<br />Four lanes working in parallel.
              </Reveal>
              <Reveal delay={2}>
                <p className="lede mt-16">
                  Boxes use normalized coordinates from 0 to 1, a fraction of the page
                  rather than pixels, so the overlay lines up at any zoom level. Sharav,
                  Siddharth, Srestha and Divya all build against the same Scan Result shape.
                </p>
              </Reveal>
              <Reveal delay={3} className="mt-24">
                <Link to="/how-it-works" className="btn">Read the contract →</Link>
              </Reveal>
            </div>
            <Reveal delay={2}>
              <div className="code-card">
                <div className="head">
                  <span style={{ display: 'inline-flex', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef5d6f' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f4b942' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5dd6a6' }} />
                  </span>
                  <span style={{ marginLeft: 8 }}>POST /api/scan · response</span>
                </div>
                <pre>{`{
  `}<span className="k">"trustScore"</span>{`: `}<span className="n">38</span>{`,
  `}<span className="k">"modelVersion"</span>{`: `}<span className="s">"v0"</span>{`,
  `}<span className="k">"elements"</span>{`: [
    {
      `}<span className="k">"type"</span>{`: `}<span className="s">"image"</span>{`,
      `}<span className="k">"page"</span>{`: `}<span className="n">1</span>{`,
      `}<span className="k">"bbox"</span>{`: [`}<span className="n">0.12</span>{`, `}<span className="n">0.30</span>{`, `}<span className="n">0.25</span>{`, `}<span className="n">0.18</span>{`],
      `}<span className="k">"classification"</span>{`: `}<span className="s">"synthetic"</span>{`,
      `}<span className="k">"confidence"</span>{`: `}<span className="n">0.94</span>{`
    },
    {
      `}<span className="k">"type"</span>{`: `}<span className="s">"image"</span>{`,
      `}<span className="k">"page"</span>{`: `}<span className="n">1</span>{`,
      `}<span className="k">"bbox"</span>{`: [`}<span className="n">0.55</span>{`, `}<span className="n">0.62</span>{`, `}<span className="n">0.20</span>{`, `}<span className="n">0.15</span>{`],
      `}<span className="k">"classification"</span>{`: `}<span className="s">"authentic"</span>{`,
      `}<span className="k">"confidence"</span>{`: `}<span className="n">0.88</span>{`
    }
  ]
}`}</pre>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section-tight">
        <div className="container">
          <Reveal as="div" className="cta">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>Try it now · no setup</span>
            <h2 style={{ marginTop: 14 }}>See the <em className="gold-text">Trust Score</em><br /> on a real document.</h2>
            <p>Launches in stub mode. The full UI, demo PDF, and sample Scan Result are bundled. No backend required.</p>
            <div className="cta-row">
              <Link to="/login" className="btn btn-primary btn-lg">Launch demo →</Link>
              <a href="https://github.com/Syphurus/folioForge" target="_blank" rel="noreferrer" className="btn btn-lg">View on GitHub</a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}

function HeroMockup() {
  return (
    <div className="mockup">
      <div className="mockup-bar">
        <div className="dots">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
        <span className="label">folioforge.app / quarterly-report.pdf</span>
      </div>
      <div className="mockup-body">
        <div className="mockup-doc">
          <h4>Quarterly Report, Field Photos</h4>
          <div className="line" />
          <div className="line short" />
          <div className="line mid" />
          <div className="line" />
          <div className="line short" />

          <div className="mockup-img synthetic" style={{ left: '8%', top: '38%', width: '32%', height: '26%' }}>
            <span className="mockup-tag">SYNTHETIC · 94%</span>
          </div>
          <div className="mockup-img authentic" style={{ left: '54%', top: '62%', width: '26%', height: '22%' }}>
            <span className="mockup-tag">AUTHENTIC · 88%</span>
          </div>
        </div>

        <div className="mockup-side">
          <div className="mockup-score">
            <div className="label">Trust score</div>
            <div className="num">38<small> / 100</small></div>
            <div className="bar"><span /></div>
          </div>
          <div className="mockup-list">
            <div className="item"><span className="d s" /> AI-generated · pg 1</div>
            <div className="item"><span className="d a" /> Authentic · pg 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
