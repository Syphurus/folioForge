import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';

const MEMBERS = [
  { name: 'Sharav',    role: 'Frontend',  job: 'The screens the user sees and clicks. Owns the PDF viewer and the authenticity overlay.' },
  { name: 'Siddharth', role: 'Gateway',   job: 'The single middleman. Express + SQLite + local file storage. Holds the system together.' },
  { name: 'Srestha',   role: 'PDF Ops',   job: 'FastAPI routes for merge, compress, split. Reads a file, writes a new file, returns it.' },
  { name: 'Divya',     role: 'Detection', job: 'The star feature. Image extraction, the detection model, the Trust Score aggregation.' },
];

export default function Team() {
  return (
    <>
      <Nav />

      <section className="section">
        <div className="container">
          <div className="sec-head">
            <Reveal><span className="eyebrow">Four lanes · One repo</span></Reveal>
            <Reveal delay={1} as="h1" className="display" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
              The team behind <em>FolioForge</em>.
            </Reveal>
            <Reveal delay={2}>
              <p className="lede">
                Each lane is owned end to end by one person. Within your lane you have full
                authority — only the contract is shared and fixed.
              </p>
            </Reveal>
          </div>

          <div className="team">
            {MEMBERS.map((m, i) => (
              <Reveal key={m.name} delay={Math.min(i + 1, 4)} className="member">
                <div className="avatar">{m.name[0]}</div>
                <h4>{m.name}</h4>
                <div className="role">{m.role}</div>
                <p>{m.job}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal as="div" className="cta">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>Goal · take it forward</span>
            <h2 style={{ marginTop: 14 }}>A demoable prototype<br />for <em className="gold-text">review</em> & improvements.</h2>
            <p>This is sprint v1.0 — the thin slice. Once it lands, we layer in OCR, batch scan, certificates, and the rest of the SRS.</p>
            <div className="cta-row">
              <Link to="/login" className="btn btn-primary btn-lg">Launch the demo →</Link>
              <a href="https://github.com/Syphurus/folioForge" target="_blank" rel="noreferrer" className="btn btn-lg">Star the repo</a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
