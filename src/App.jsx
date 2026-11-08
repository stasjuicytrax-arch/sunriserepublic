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
const links = [['The club', '#club'], ['Atmosphere', '#atmosphere'], ['Events', '#events'], ['Opening', '#opening'], ['Find us', '#find-us']];
const images = [
  { src: 'main-room.webp', title: 'The main room', detail: 'The dance floor', width: 2000, height: 1246, alt: 'Interior visualization of the main room with angular ceiling lights, red walls and a central DJ booth.' },
  { src: 'bar.webp', title: 'At the bar', detail: 'Sculpted light', width: 2000, height: 915, alt: 'Interior visualization of the long illuminated bar and sculptural ceiling lights.' },
  { src: 'lounge.webp', title: 'The lounge', detail: 'A quieter corner', width: 1116, height: 1400, alt: 'Red lounge seating under mirrored ceiling lights with the SR monogram on the wall.' },
  { src: 'mirrors.webp', title: 'Mirrors & details', detail: 'Glass and stone', width: 1024, height: 1280, alt: 'Restroom interior with an illuminated mirror, glass blocks and dark stone basins.' },
];
const mirrorsIndex = images.findIndex(image => image.src === 'mirrors.webp');
const posters = [
  { title: 'Mix & Mangle', src: 'poster-mix-and-mangle.webp', width: 616 },
  { title: 'Rise & Shine', src: 'poster-rise-and-shine.webp', width: 607 },
  { title: 'Tempo Rush', src: 'poster-tempo-rush.webp', width: 607 },
];

function TitleEnd({ children }) {
  return <span className="title-end">{children}<span className="chapter-period">.</span></span>;
}

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

function Navigation({ paused, reduced, onToggleMotion }) {
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
  const motionLabel = paused ? 'Resume background motion' : 'Pause background motion';
  const motionIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paused ? 'M9 5l11 7-11 7V5Z' : 'M9 6v12m6-12v12'}/></svg>;
  return <>
    <header className={`site-header ${compact ? 'is-compact' : ''}`}>
      <div className="nav-shell glass">
        <a className="brand" href="#home" aria-label="SUNRISE REPUBLIC — home" translate="no"><BrandMark/><span>SUNRISE<br/>REPUBLIC</span></a>
        <nav className="nav-links" aria-label="Main navigation" inert={compact || undefined}>
          {links.map(([text, href]) => <a key={href} href={href}>{text}</a>)}
          {!reduced && <button className="nav-motion" aria-label={motionLabel} title={motionLabel} onClick={onToggleMotion}>{motionIcon}</button>}
          <a className="button button-red nav-cta" href={mapUrl} target="_blank" rel="noreferrer">Get directions <Arrow/></a>
        </nav>
        <button className="menu-trigger" ref={trigger} aria-label="Open menu" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(true)}><span/><span/></button>
      </div>
    </header>
    <dialog ref={dialog} id="main-menu" className="menu-dialog" aria-label="Main menu" onCancel={close} onClick={e => { if (e.target === dialog.current) close(); }}>
      <div className="menu-top"><span translate="no">SUNRISE REPUBLIC</span><button className="round-button" aria-label="Close menu" onClick={close}><CloseIcon/></button></div>
      <nav aria-label="Expanded navigation">{links.map(([text, href], i) => <a href={href} key={href} onClick={close} style={{ '--menu-order': i }}><span className="menu-number">0{i + 1}</span><span>{text}</span><Arrow/></a>)}</nav>
      <div className="menu-bottom"><p>Nha Trang, Vietnam<br/><span>Planned opening · 31 December</span></p><a href={mapUrl} className="button button-red" target="_blank" rel="noreferrer">Get directions <Arrow/></a></div>
      {!reduced && <button className="menu-motion" onClick={onToggleMotion}>{motionIcon}{motionLabel}</button>}
    </dialog>
  </>;
}

function Gallery({ index, setIndex, full, setFull }) {
  const dialog = useRef(null);
  const touch = useRef(0);
  const swiped = useRef(false);
  const current = images[index];
  const change = (direction) => setIndex(i => (i + direction + images.length) % images.length);
  useEffect(() => {
    if (full) { dialog.current.showModal(); document.body.style.overflow = 'hidden'; }
    else { dialog.current.close(); document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [full]);
  const controls = <><button className="round-button glass" aria-label="Previous interior" onClick={() => change(-1)}><Arrow direction="left"/></button><button className="round-button glass" aria-label="Next interior" onClick={() => change(1)}><Arrow direction="right"/></button></>;
  return <>
    <div className="gallery-reel" role="region" aria-label="Interior previews" aria-roledescription="carousel">
      <div className="gallery-stage" onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); change(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); change(-1); } }} onTouchStart={e => { touch.current = e.changedTouches[0].clientX; swiped.current = false; }} onTouchEnd={e => { const d = touch.current - e.changedTouches[0].clientX; if (Math.abs(d) > 50) { swiped.current = true; change(d > 0 ? 1 : -1); } }}>
        <button className="gallery-open" aria-label={`Enlarge ${current.title}`} onClick={() => { if (!swiped.current) setFull(true); swiped.current = false; }}>
          <span className="gallery-camera">
            {current.width < current.height && <span className="gallery-matte" aria-hidden="true" style={{ backgroundImage: `url('${media(current.src)}')` }}/>}
            {images.map((im, i) => <img key={im.src} src={media(im.src)} alt={im.alt} className={i === index ? 'is-active' : ''} aria-hidden={i !== index} loading="lazy" decoding="async" width={im.width} height={im.height}/>) }
          </span>
          <span className="gallery-exposure" aria-hidden="true"/>
          <span className="gallery-hint glass">View full frame <Arrow/></span>
          <span className="gallery-scene-label" aria-hidden="true" key={index}><span>0{index + 1} / 0{images.length}</span>{current.title}</span>
        </button>
        <div className="gallery-controls">{controls}</div>
      </div>
      <div className="gallery-index" aria-label="Choose an interior">
        <p className="gallery-index-label">Inside the club <span aria-live="polite" className="gallery-live">{current.title}</span></p>
        {images.map((im, i) => (
          <button className="gallery-pick" key={im.src} aria-pressed={i === index} onClick={() => setIndex(i)}>
            <img src={media(im.src)} alt="" loading="lazy" decoding="async" width={im.width} height={im.height}/>
            <span><span className="gallery-pick-number">0{i + 1} · {im.detail}</span><strong>{im.title}</strong></span>
          </button>
        ))}
      </div>
    </div>
    <dialog ref={dialog} className="lightbox" aria-label="Club interior gallery" onCancel={() => setFull(false)} onKeyDown={e => { if (e.key === 'ArrowRight') change(1); if (e.key === 'ArrowLeft') change(-1); }} onClick={e => { if (e.target === dialog.current) setFull(false); }}>
      <button className="round-button glass lightbox-close" aria-label="Close image" onClick={() => setFull(false)}><CloseIcon/></button>
      {full && <img key={index} src={media(current.src)} alt={current.alt} width={current.width} height={current.height}/>}
      <div className="lightbox-bottom"><p aria-live="polite">{current.title}</p><div className="gallery-controls">{controls}</div></div>
    </dialog>
  </>;
}

function UpcomingEvents() {
  return (
    <section className="events section-wrap" id="events" aria-labelledby="events-title">
      <div className="events-inner">
        <div className="events-heading">
          <p className="section-kicker chapter-kicker">Programme <span>04</span></p>
          <h2 id="events-title"><span className="word-mask"><span className="chapter-word">UPCOMING <TitleEnd>EVENTS</TitleEnd></span></span></h2>
          <p className="section-intro">A first look at the programme.<br/>{' '}Dates to be announced.</p>
        </div>
        <p className="events-swipe">Swipe to view the posters <Arrow direction="right"/></p>
        <ul className="event-posters" tabIndex={0} aria-label="Programme previews">
          {posters.map((poster, i) => (
            <li className="event-poster" key={poster.src}>
              <div className="event-poster-art">
                <img src={media(poster.src)} alt="" width={poster.width} height="1077" loading="lazy" decoding="async"/>
                <span className="poster-number" aria-hidden="true">0{i + 1}</span>
              </div>
              <div className="poster-caption"><h3>{poster.title}</h3><span>Preview</span></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Location() {
  const [interactive, setInteractive] = useState(false);
  return (
    <section className="location section-wrap" id="find-us" aria-labelledby="location-title">
      <div className="location-stage">
        <div className="location-copy section-reveal">
          <p className="section-kicker chapter-kicker">Nha Trang, Vietnam <span>06</span></p>
          <h2 id="location-title">FIND <TitleEnd>US</TitleEnd></h2>
          <address><strong>11 Ngô Gia Tự</strong><br/>Nha Trang, Khánh Hòa 650000<br/>Vietnam</address>
          <a className="button button-red" href={mapUrl} target="_blank" rel="noreferrer">Get directions <Arrow/></a>
        </div>
        <div className="location-map section-reveal" aria-label="Map of the club location" role="region">
          <div className="location-map-view" id="club-map-view">
            {interactive ? (
              <iframe title="Google Maps — 11 Ngô Gia Tự, Nha Trang" src={mapEmbed} referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            ) : (
              <>
                <img src={media('nha-trang-map.svg')} alt="Street map showing 11 Ngô Gia Tự near Lê Thánh Tôn and Quang Trung." width="1400" height="900" loading="lazy" />
                <svg className="map-pulse" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  {/* Matches the marker in nha-trang-map.svg. */}
                  <circle className="map-beacon" cx="766" cy="444" r="34" fill="none" stroke="#ff845f" strokeWidth="3"/>
                </svg>
              </>
            )}
          </div>
          <div className="location-map-bar">
            <button className="button glass map-toggle" aria-expanded={interactive} aria-controls="club-map-view" onClick={() => setInteractive(value => !value)}>{interactive ? 'Show map preview' : 'Open interactive map'} <Arrow direction={interactive ? 'left' : 'up-right'}/></button>
            {!interactive && <a className="map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer section-wrap">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#home" className="brand" aria-label="Sunrise Republic — home" translate="no"><BrandMark/><span>SUNRISE<br/>REPUBLIC</span></a>
            <p>STAY TILL SUNRISE.</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <h2>Explore</h2>
            {links.map(([name, href]) => <a key={href} href={href}>{name}</a>)}
          </nav>
          <div className="footer-contact">
            <h2>Visit &amp; contact</h2>
            <address>11 Ngô Gia Tự<br/>Nha Trang, Khánh Hòa, Vietnam</address>
            <a className="footer-directions" href={mapUrl} target="_blank" rel="noreferrer">Get directions <Arrow/></a>
            <p className="footer-pending">Phone · Coming soon</p>
          </div>
          <div className="footer-social">
            <h2>Socials</h2>
            <ul aria-label="Social profiles coming soon">
              <li role="img" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg></li>
              <li role="img" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 21v-8h2.7l.4-3.2H14V8c0-.9.3-1.5 1.6-1.5h1.7V3.6a20 20 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2H8V13h2.6v8z"/></svg></li>
              <li role="img" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg></li>
            </ul>
            <p className="footer-pending">Profiles coming soon</p>
          </div>
        </div>
        <div className="footer-bottom"><p>© SUNRISE REPUBLIC</p><a href="#home">Back to top <Arrow direction="up-right"/></a></div>
      </div>
    </footer>
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
      yPercent: -24, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 25%', scrub: .5 },
    });
    for (const title of root.current.querySelectorAll('.chapter-title, #events-title')) {
      gsap.from(title.querySelectorAll('.chapter-word'), {
        yPercent: 108, rotate: 2.5, stagger: .15, duration: 1.15, ease: 'power4.out',
        scrollTrigger: { trigger: title, start: 'top 90%', once: true },
      });
    }
    gsap.fromTo('.gallery-camera', { scale: 1.03, yPercent: 1 }, {
      scale: 1.21, yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.gallery-stage', start: 'top bottom', end: 'bottom 24%', scrub: .5 },
    });
    gsap.fromTo('.gallery-exposure', { xPercent: -110, opacity: .48 }, {
      xPercent: 110, opacity: 0, ease: 'power2.out', duration: 1.5,
      scrollTrigger: { trigger: '.gallery-stage', start: 'top 79%', once: true },
    });
    gsap.fromTo('.atmosphere-photo img', { yPercent: -3.5, scale: 1.085 }, {
      yPercent: 3.5, scale: 1.085, ease: 'none',
      scrollTrigger: { trigger: '.atmosphere', start: 'top bottom', end: 'bottom top', scrub: .45 },
    });
    gsap.from('.atmosphere-heading .word', {
      yPercent: 110, stagger: .16, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.atmosphere-heading', start: 'top 88%', once: true },
    });
    gsap.fromTo('.opening-art img', { yPercent: -4, scale: 1.11 }, {
      yPercent: 4, scale: 1.11, ease: 'none',
      scrollTrigger: { trigger: '.first-night', start: 'top bottom', end: 'bottom top', scrub: .55 },
    });
    gsap.from('.event-poster', {
      y: 36, opacity: .35, duration: .95, stagger: .11, ease: 'power3.out',
      scrollTrigger: { trigger: '.event-posters', start: 'top 86%', once: true },
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
    <GlassFilter/><Navigation paused={paused} reduced={reduced} onToggleMotion={() => setPaused(value => !value)}/>
    <main id="main">
      <section id="home" className="hero" aria-labelledby="hero-title">
        <SunriseScene paused={paused || reduced}/>
        <div className="hero-shade"/>
        <div className="hero-content">
          <p className="hero-location"><span className="location-dot"/> Nightclub · Nha Trang, Vietnam</p>
          <h1 id="hero-title"><span className="hero-line hero-line-intro"><span>STAY TILL</span></span>{' '}<span className="hero-line hero-line-title"><span>SUNRISE</span></span></h1>
        </div>
      </section>
      <section id="club" className="club section-wrap" aria-labelledby="club-title">
        <div className="club-inner">
          <div className="club-heading">
            <p className="section-kicker chapter-kicker">The space <span>01</span></p>
            <h2 id="club-title" className="chapter-title"><span className="word-mask"><span className="chapter-word">INSIDE THE</span></span>{' '}<span className="word-mask"><span className="chapter-word"><TitleEnd>REPUBLIC</TitleEnd></span></span></h2>
            <p className="section-intro">Red light. Reflective surfaces.<br/>{' '}A space built around music.</p>
          </div>
          <Gallery index={galleryIndex} setIndex={setGalleryIndex} full={galleryFull} setFull={setGalleryFull}/>
        </div>
      </section>
      <section id="atmosphere" className="atmosphere" aria-labelledby="atmosphere-title">
        <div className="atmosphere-photo">
          <picture>
            <source media="(max-width: 760px)" srcSet={media('atmosphere.webp')} width="1086" height="1448"/>
            <img src={media('atmosphere-wide.webp')} alt="An editorial image of two friends dancing in warm red light." loading="lazy" decoding="async" width="1672" height="941"/>
          </picture>
          <span className="photo-note">A feeling, before the first night.</span>
        </div>
        <div className="atmosphere-copy">
          <p className="atmosphere-kicker">The atmosphere <span>02</span></p>
          <h2 id="atmosphere-title" className="atmosphere-heading"><span className="word-mask"><span className="word">FEEL THE</span></span>{' '}<span className="word-mask"><span className="word"><TitleEnd>NIGHT</TitleEnd></span></span></h2>
          <p className="atmosphere-description">Electronic music.<br/>A shared pulse.</p>
          <a href="#opening" className="button glass atmosphere-link">THE FIRST NIGHT <Arrow direction="down"/></a>
        </div>
      </section>
      <section className="details section-wrap" id="details" aria-labelledby="details-title">
        <div className="details-inner">
          <div className="details-heading section-reveal">
            <p className="section-kicker chapter-kicker">Light &amp; materials <span>03</span></p>
            <h2 id="details-title">EVERY DETAIL <TitleEnd>MATTERS</TitleEnd></h2>
          </div>
          <div className="details-spread">
            <figure className="detail-lounge section-reveal">
              <div className="detail-media"><img src={media('lounge.webp')} width="1116" height="1400" loading="lazy" alt="Red lounge seating under mirrored ceiling lights with the SR monogram on the wall." /></div>
              <figcaption><span><strong>The lounge</strong>Mirrored ceiling · Red banquettes</span><span>01</span></figcaption>
            </figure>
            <figure className="detail-mirrors section-reveal">
              <button className="detail-media" onClick={() => { setGalleryIndex(mirrorsIndex); setGalleryFull(true); }} aria-label="Enlarge Mirrors and details">
                <img src={media('mirrors.webp')} width="1024" height="1280" loading="lazy" alt="Lit circular mirror and glass blocks above dark stone basins." />
                <span className="detail-arrow glass"><Arrow/></span>
              </button>
              <figcaption><span><strong>Mirrors &amp; details</strong>Glass blocks · Dark stone</span><span>02</span></figcaption>
            </figure>
          </div>
        </div>
      </section>
      <UpcomingEvents/>
      <section className="first-night section-wrap" id="opening" aria-labelledby="opening-title">
        <div className="opening-art" aria-hidden="true"><img src={media('opening-horizon.webp')} alt="" width="1254" height="1254" loading="lazy" decoding="async"/></div>
        <div className="first-night-inner">
          <div className="first-night-top section-reveal"><p className="section-kicker chapter-kicker">THE FIRST NIGHT <span>05</span></p><p className="opening-status">Planned opening</p></div>
          <h2 id="opening-title" className="chapter-title"><time dateTime="12-31"><span className="word-mask"><span className="chapter-word opening-day">31</span></span>{' '}<span className="word-mask"><span className="chapter-word opening-month">December</span></span></time></h2>
          <div className="first-night-bottom section-reveal"><p>NHA TRANG, VIETNAM</p><a href="#find-us" className="button glass">Find us in Nha Trang <Arrow direction="down"/></a></div>
        </div>
      </section>
      <Location/>
    </main>
    <Footer/>
  </div>;
}
