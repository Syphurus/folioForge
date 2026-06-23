import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';

export default function HowItWorks() {
  return (
    <>
      <Nav />

      <section className="section">
        <div className="container">
          <div className="sec-head">
            <Reveal><span className="eyebrow">The architecture</span></Reveal>
            <Reveal delay={1} as="h1" className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
              The <em>one flow</em><br />that must work.
            </Reveal>
            <Reveal delay={2}>
              <p className="lede">
                Three moving parts. The frontend talks only to the gateway. The gateway is the
                single middleman that talks to the Python service. Clean lanes, no surprises.
              </p>
            </Reveal>
          </div>

          <Reveal>
            <div className="steps">
              <div className="step">
                <div className="num">01</div>
                <h4>Sign in</h4>
                <p>One-token auth. No multi-tenancy this sprint. Single workspace.</p>
              </div>
              <div className="step">
                <div className="num">02</div>
                <h4>Upload & edit</h4>
                <p>Drag-and-drop. Merge, compress, or split. Add a highlight. Download.</p>
              </div>
              <div className="step">
                <div className="num">03</div>
                <h4>Check authenticity</h4>
                <p>Server extracts every image, classifies it, and returns a Scan Result.</p>
              </div>
              <div className="step">
                <div className="num">04</div>
                <h4>See the evidence</h4>
                <p>Trust Score plus on-page boxes around suspect regions. Hover for confidence.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal>
              <span className="eyebrow">The contract · §5</span>
              <h2 className="display mt-16" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)' }}>
                Built against <em>fake data</em> first.
              </h2>
              <p className="lede mt-16">
                Everyone codes against the frozen message shapes from day one.
                Day-1 stubs unblock parallel work; day-3 swaps them for real code.
                Nothing in the UI changes because the shapes never changed.
              </p>
              <div className="mt-24 row" style={{ flexWrap: 'wrap', gap: 10 }}>
                <a href="https://github.com/Syphurus/folioForge/blob/main/docs/CONTRACT.md" target="_blank" rel="noreferrer" className="btn">Full contract on GitHub →</a>
                <a href="https://github.com/Syphurus/folioForge/blob/main/docs/BUILD_PLAN.md" target="_blank" rel="noreferrer" className="btn btn-ghost">Build plan</a>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="code-card">
                <div className="head">
                  <span className="pill-dot pill" />
                  <span style={{ marginLeft: 8 }}>Frontend → Gateway</span>
                </div>
                <pre>{`POST `}<span className="k">/api/login</span>{`     → { token }
POST `}<span className="k">/api/upload</span>{`    → { fileId, filename, pageCount }
GET  `}<span className="k">/api/files</span>{`     → [ { fileId, filename, pageCount } ]
GET  `}<span className="k">/api/files/:id/raw</span>{` → PDF bytes
POST `}<span className="k">/api/merge</span>{`     → { fileId }
POST `}<span className="k">/api/compress</span>{`  → { fileId }
POST `}<span className="k">/api/split</span>{`     → { fileIds:[…] }
POST `}<span className="k">/api/scan</span>{`      → `}<span className="s">ScanResult</span></pre>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sec-head">
            <Reveal><span className="eyebrow">The timeline</span></Reveal>
            <Reveal delay={1} as="h2" className="display">
              Five days. <em>Demo on Friday.</em>
            </Reveal>
          </div>

          <Reveal>
            <div className="code-card">
              <div className="head"><span>Day-by-day master timeline</span></div>
              <pre style={{ fontSize: 12, lineHeight: 1.8 }}>{`Day 1  Scaffold everything · stubs everywhere
Day 2  Operation buttons + annotation + download
Day 3  Integration day · swap stubs for real code  ← danger day
Day 4  Polish overlay · loading & error states · authenticity report
Day 5  Buffer + demo prep · rehearse the §2 flow twice`}</pre>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <Reveal as="div" className="cta">
            <h2>Ready to <em className="gold-text">try it</em>?</h2>
            <p>The demo runs in stub mode. Full UI, real PDF, real Scan Result. No backend needed.</p>
            <div className="cta-row">
              <Link to="/login" className="btn btn-primary btn-lg">Launch demo →</Link>
              <Link to="/team" className="btn btn-lg">Meet the team</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
