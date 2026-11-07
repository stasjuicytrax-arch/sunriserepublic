import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SunriseScene from './SunriseScene.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const base = import.meta.env.BASE_URL;
const media = (name) => `${base}media/${name}`;
const address = '11 Ngô Gia Tự, Nha Trang, Khánh Hòa 650000, Vietnam';
const mapQuery = encodeURIComponent(address);
const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
const mapEmbed = `https://maps.google.com/maps?q=${mapQuery}&z=17&output=embed`;
const links = [['The club', '#club'], ['Atmosphere', '#atmosphere'], ['Opening', '#opening'], ['Find us', '#find-us']];
const images = [
  { src: 'main-room.webp', title: 'The main room', alt: 'Interior visualization of the main room with angular ceiling lights, red walls and a central DJ booth.' },
  { src: 'bar.webp', title: 'At the bar', alt: 'Interior visualization of the long illuminated bar and sculptural ceiling lights.' },
  { src: 'mirrors.webp', title: 'Mirrors & details', alt: 'Restroom interior with an illuminated mirror, glass blocks and dark stone basins.' },
];

function Arrow({ direction = 'up-right', ...props }) {
  const paths = { 'up-right': 'M6 18 18 6M6 6h12v12', down: 'M12 4v16m-7-7 7 7 7-7', right: 'm9 5 7 7-7 7', left: 'm15 5-7 7 7 7' };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[direction]} /></svg>;
}

function BrandMark() {
  // Window onto the original supplied monogram; the artwork is not redrawn.
  return <svg className="brand-mark" viewBox="120 20 700 525" aria-hidden="true"><image href={media('logo.png')} width="989" height="853"/></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>;
}

function GlassFilter() {
  const map = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><defs><linearGradient id='x'><stop stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient><linearGradient id='y' x1='0' y1='0' x2='0' y2='1'><stop stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient><filter id='b'><feGaussianBlur stdDeviation='10.6'/></filter></defs><rect width='256' height='256' fill='url(#x)'/><rect width='256' height='256' fill='url(#y)' style='mix-blend-mode:screen'/><rect x='32' y='32' width='192' height='192' rx='32' fill='#808000' filter='url(#b)'/></svg>`;
  return <svg className="filter-defs" aria-hidden="true"><defs><filter id="sr-liquid" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB"><feImage href={`data:image/svg+xml,${encodeURIComponent(map)}`} width="100%" height="100%" preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="22" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>;
}

function Navigation() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    let last = window.scrollY, acc = 0, frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY, delta = y - last;
      last = y;
      acc = Math.sign(delta) === Math.sign(acc) ? acc + delta : delta;
      if (y < 80) setCompact(false);
      else if (acc >= 80) setCompact(true);
      else if (acc < -40) setCompact(false);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => { window.removeEventListener('scroll', scroll); cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    if (open) { dialog.current.showModal(); document.body.style.overflow = 'hidden'; }
    else { dialog.current.close(); document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return <>
    <header className={`site-header ${compact ? 'is-compact' : ''}`}>
      <div className="nav-shell glass">
        <a className="brand" href="#home" aria-label="SUNRISE REPUBLIC — home" translate="no"><BrandMark/><span>SUNRISE<br/>REPUBLIC</span></a>
        <nav className="nav-links" aria-label="Main navigation" inert={compact || undefined}>
          {links.map(([text, href]) => <a key={href} href={href}>{text}</a>)}
          <a className="button button-red nav-cta" href={mapUrl} target="_blank" rel="noreferrer">Get directions <Arrow/></a>
        </nav>
        <button className="menu-trigger" ref={trigger} aria-label="Open menu" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(true)}><span/><span/></button>
      </div>
    </header>
    <dialog ref={dialog} id="main-menu" className="menu-dialog" aria-label="Main menu" onCancel={close} onClick={e => { if (e.target === dialog.current) close(); }}>
      <div className="menu-top"><span translate="no">SUNRISE REPUBLIC</span><button className="round-button" aria-label="Close menu" onClick={close}><CloseIcon/></button></div>
      <nav aria-label="Expanded navigation">{links.map(([text, href], i) => <a href={href} key={href} onClick={close} style={{ '--menu-order': i }}><span className="menu-number">0{i + 1}</span><span>{text}</span><Arrow/></a>)}</nav>
      <div className="menu-bottom"><p>Nha Trang, Vietnam<br/><span>Planned opening · 31 December</span></p><a href={mapUrl} className="button button-red" target="_blank" rel="noreferrer">Get directions <Arrow/></a></div>
    </dialog>
  </>;
}

function Gallery({ index, setIndex, full, setFull }) {
  const dialog = useRef(null);
  const touch = useRef(0);
  const swiped = useRef(false);
  const change = (direction) => setIndex(i => (i + direction + images.length) % images.length);
  useEffect(() => {
    if (full) { dialog.current.showModal(); document.body.style.overflow = 'hidden'; }
    else { dialog.current.close(); document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [full]);
  const controls = <><button className="round-button glass" aria-label="Previous interior" onClick={() => change(-1)}><Arrow direction="left"/></button><button className="round-button glass" aria-label="Next interior" onClick={() => change(1)}><Arrow direction="right"/></button></>;
  return <>
    <div className="gallery-stage" role="region" aria-label="Interior previews" aria-roledescription="carousel" onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); change(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); change(-1); } }} onTouchStart={e => { touch.current = e.changedTouches[0].clientX; swiped.current = false; }} onTouchEnd={e => { const d = touch.current - e.changedTouches[0].clientX; if (Math.abs(d) > 50) { swiped.current = true; change(d > 0 ? 1 : -1); } }}>
      <button className="gallery-open" aria-label={`Enlarge ${images[index].title}`} onClick={() => { if (!swiped.current) setFull(true); swiped.current = false; }}>
        {images.map((im, i) => <img key={im.src} src={media(im.src)} alt={im.alt} className={i === index ? 'is-active' : ''} aria-hidden={i !== index} loading="lazy" decoding="async" width="2000" height="1246" />)}
        <span className="gallery-hint glass">Take a closer look <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span>
        <span className="gallery-scene-label" aria-hidden="true" key={index}><span>0{index + 1} / 0{images.length}</span>{images[index].title}</span>
      </button>
      <div className="gallery-controls">{controls}</div>
    </div>
    <div className="gallery-caption"><span aria-live="polite">{images[index].title}</span><div className="gallery-pagination" aria-label="Choose an interior">{images.map((im, i) => <button key={im.src} aria-label={`Show ${im.title}`} aria-pressed={i === index} onClick={() => setIndex(i)}><span/></button>)}</div><span>Interior preview <span className="gallery-count">0{index + 1} / 0{images.length}</span></span></div>
    <dialog ref={dialog} className="lightbox" aria-label="Club interior gallery" onCancel={() => setFull(false)} onKeyDown={e => { if (e.key === 'ArrowRight') change(1); if (e.key === 'ArrowLeft') change(-1); }} onClick={e => { if (e.target === dialog.current) setFull(false); }}>
      <button className="round-button glass lightbox-close" aria-label="Close image" onClick={() => setFull(false)}><CloseIcon/></button>
      {full && <img key={index} src={media(images[index].src)} alt={images[index].alt} width="2000" height="1246"/>}
      <div className="lightbox-bottom"><p aria-live="polite">{images[index].title}</p><div className="gallery-controls">{controls}</div></div>
    </dialog>
  </>;
}

function Location() {
  return (
    <section className="location section-wrap" id="find-us" aria-labelledby="location-title">
      <div className="location-copy section-reveal">
        <p className="section-kicker chapter-kicker">Nha Trang, Vietnam <span>05</span></p>
        <h2 id="location-title">FIND US.</h2>
        <address>11 Ngô Gia Tự<br/>Nha Trang, Khánh Hòa 650000<br/>Vietnam</address>
        <a className="button button-red" href={mapUrl} target="_blank" rel="noreferrer">Get directions <Arrow/></a>
      </div>
      <div className="location-map section-reveal">
        <iframe title="Google Maps — 11 Ngô Gia Tự, Nha Trang" src={mapEmbed} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      </div>
    </section>
  );
}

export default function App() {
  const root = useRef(null);
  const [paused, setPaused] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryFull, setGalleryFull] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useGSAP(() => {
    if (reduced) return;
    gsap.to('.hero-content', {
      yPercent: -24, scale: .92, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 25%', scrub: .5 },
    });
    gsap.from('.club-heading > *', {
      y: 38, opacity: .35, stagger: .11, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: '.club-heading', start: 'top 87%', once: true },
    });
    gsap.fromTo('.gallery-stage', { clipPath: 'inset(10% 14% 10% 14%)', '--room-scale': 1.22 }, {
      clipPath: 'inset(0% 0% 0% 0%)', '--room-scale': 1, ease: 'none',
      scrollTrigger: { trigger: '.gallery-stage', start: 'top 98%', end: 'top 29%', scrub: .45 },
    });
    gsap.fromTo('.atmosphere-photo img', { yPercent: -9, scale: 1.21 }, {
      yPercent: 9, scale: 1.21, ease: 'none',
      scrollTrigger: { trigger: '.atmosphere', start: 'top bottom', end: 'bottom top', scrub: .45 },
    });
    gsap.from('.atmosphere-heading .word', {
      yPercent: 110, stagger: .16, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.atmosphere-heading', start: 'top 88%', once: true },
    });
    gsap.from('.atmosphere-signature', {
      x: 34, opacity: .3, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: '.atmosphere-signature', start: 'top 92%', once: true },
    });
    gsap.fromTo('.first-night-orbits', { scale: .7, rotate: -13 }, {
      scale: 1.2, rotate: 12, ease: 'none',
      scrollTrigger: { trigger: '.first-night', start: 'top bottom', end: 'bottom top', scrub: .5 },
    });
    for (const selector of ['.details', '.first-night', '.location']) {
      gsap.from(`${selector} .section-reveal`, {
        scrollTrigger: { trigger: selector, start: 'top 80%', once: true },
        opacity: 0, y: 32, stagger: .12, duration: .95, ease: 'power3.out',
      });
    }
    let active = true;
    document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    return () => { active = false; };
  }, { scope: root, dependencies: [reduced], revertOnUpdate: true });
  return <div ref={root} className={paused || reduced ? 'motion-paused' : undefined}>
    <a href="#main" className="skip-link">Skip to content</a>
    <GlassFilter/><Navigation/>
    <main id="main">
      <section id="home" className="hero" aria-labelledby="hero-title">
        <SunriseScene paused={paused || reduced}/>
        <div className="hero-shade"/>
        <div className="hero-content">
          <p className="hero-location"><span className="location-dot"/> Nightclub · Nha Trang, Vietnam</p>
          <h1 id="hero-title"><span className="hero-line hero-line-intro"><span>STAY TILL</span></span><span className="hero-line hero-line-title"><span>SUNRISE.</span></span></h1>
        </div>
        <div className="hero-bottom">
          <button className="motion-control" onClick={() => setPaused(v => !v)} aria-label={paused || reduced ? 'Play ambient animation' : 'Pause ambient animation'} aria-pressed={paused || reduced} disabled={reduced}><span className={`motion-icon ${paused || reduced ? 'paused' : ''}`} aria-hidden="true"><i/><i/><i/><i/></span><span>{paused || reduced ? 'Motion paused' : 'Pause motion'}</span></button>
          <a className="button glass hero-action" href="#club">Explore the club <Arrow direction="down"/></a>
          <div className="opening-note"><span>Planned opening</span><p>31 December<svg className="opening-star" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.5">{Array.from({ length: 8 }, (_, i) => <path key={i} d="M20 4v9" transform={`rotate(${i * 45} 20 20)`}/>)}<circle cx="20" cy="20" r="3"/></g></svg></p></div>
        </div>
      </section>
      <section id="club" className="club section-wrap" aria-labelledby="club-title">
        <div className="club-heading"><p className="section-kicker">The space <span>01</span></p><h2 id="club-title">INSIDE THE<br/>REPUBLIC</h2><p className="section-intro">Red light. Reflective surfaces.<br/>A space built around music.</p></div>
        <Gallery index={galleryIndex} setIndex={setGalleryIndex} full={galleryFull} setFull={setGalleryFull}/>
      </section>
      <section id="atmosphere" className="atmosphere" aria-labelledby="atmosphere-title">
        <div className="atmosphere-photo"><img src={media('atmosphere.webp')} alt="An editorial image of two friends dancing in warm red light." loading="lazy" width="1086" height="1448"/><span className="photo-note">A feeling, before the first night.</span></div>
        <div className="atmosphere-copy"><p className="atmosphere-kicker">The atmosphere <span>02</span></p><h2 id="atmosphere-title" className="atmosphere-heading"><span className="word-mask"><span className="word">FEEL THE</span></span><span className="word-mask"><span className="word">NIGHT.</span></span></h2><p className="atmosphere-description">Electronic music.<br/>A shared pulse.</p></div>
        <div className="atmosphere-signature"><p>Stay till sunrise.</p><a href="#opening" className="button glass">The first night <Arrow direction="down"/></a></div>
      </section>
      <section className="details section-wrap" aria-labelledby="details-title">
        <div className="details-heading section-reveal">
          <p className="section-kicker chapter-kicker">Light &amp; materials <span>03</span></p>
          <h2 id="details-title">EVERY DETAIL<br/>MATTERS.</h2>
        </div>
        <div className="details-spread">
          <figure className="detail-lounge section-reveal">
            <img src={media('lounge.webp')} width="1116" height="1400" loading="lazy" alt="Red lounge seating under mirrored ceiling lights with the SR monogram on the wall." />
            <figcaption><span>The lounge</span><span>01</span></figcaption>
          </figure>
          <figure className="detail-mirrors section-reveal">
            <button onClick={() => { setGalleryIndex(2); setGalleryFull(true); }} aria-label="Enlarge Mirrors and details">
              <img src={media('mirrors.webp')} width="1024" height="1280" loading="lazy" alt="Lit circular mirror and glass blocks above dark stone basins." />
              <span className="detail-arrow glass"><Arrow/></span>
            </button>
            <figcaption><span>Mirrors &amp; details</span><span>02</span></figcaption>
          </figure>
        </div>
      </section>
      <section className="first-night section-wrap" id="opening" aria-labelledby="opening-title">
        <div className="first-night-light" aria-hidden="true"/>
        <svg className="first-night-orbits" viewBox="0 0 1000 390" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx="500" cy="195" rx={306 + i * 22} ry={67 + i * 12} transform={`rotate(${i * 3 - 12} 500 195)`}/>) }
          </g>
        </svg>
        <div className="first-night-inner">
          <p className="section-kicker chapter-kicker section-reveal">The first night <span>04</span></p>
          <p className="opening-status section-reveal">Planned opening</p>
          <h2 id="opening-title" className="section-reveal"><time dateTime="12-31">31 December</time></h2>
          <a href="#find-us" className="button glass section-reveal">Find us in Nha Trang <Arrow direction="down"/></a>
        </div>
      </section>
      <Location/>
    </main>
    <footer className="preview-footer"><a href="#home" className="brand" translate="no"><BrandMark/><span>SUNRISE<br/>REPUBLIC</span></a><p>Stay till sunrise.</p><a href="#home">Back to top <Arrow direction="up-right"/></a></footer>
  </div>;
}
