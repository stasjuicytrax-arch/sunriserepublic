import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { nav } from '@/content/nav'
import { catalog } from '@/content/catalog'
import { site } from '@/content/site'
import { LogoMark } from '@/components/logo/LogoMark'
import { Button } from '@/components/ui/button'
import { getLenis } from '@/lib/lenis'
import { useScramble } from '@/lib/scramble'
import { cn } from '@/lib/utils'

const EXPO = [0.16, 1, 0.3, 1] as const

function Logo({ className }: { className?: string }) {
  return (
    <Link to={nav.home.to} aria-label={nav.home.label} className={cn('flex items-center gap-2 font-heading text-[15px] font-semibold uppercase tracking-[-0.02em] text-white', className)}>
      <LogoMark className="size-5 text-lime" />
      <span>{site.name}</span>
    </Link>
  )
}

function Burger({ open, onClick, controls, tabIndex }: { open: boolean; onClick: () => void; controls: string; tabIndex?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? nav.menuClose : nav.menuOpen}
      className="relative grid size-11 place-items-center rounded-full text-white transition-colors duration-(--t-fast) ease-soft hover:bg-white/10"
    >
      <span className={cn('absolute h-px w-5 bg-current transition-transform duration-(--t-base) ease-out-expo', open ? 'rotate-45' : '-translate-y-[4px]')} />
      <span className={cn('absolute h-px w-5 bg-current transition-transform duration-(--t-base) ease-out-expo', open ? '-rotate-45' : 'translate-y-[4px]')} />
    </button>
  )
}

function MegaMenu({ id, onClose, onEnter, onLeave }: { id: string; onClose: () => void; onEnter: () => void; onLeave: () => void }) {
  return (
    <motion.div
      id={id}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
      transition={{ duration: 0.42, ease: EXPO }}
      className="absolute left-1/2 bg-ink-2 shadow-[inset_0_0_0_1px_var(--de-line),0_24px_48px_-24px_var(--de-void)] top-[calc(100%+12px)] w-[min(880px,calc(100vw-2*var(--margin)))] -translate-x-1/2 rounded-lg p-6"
    >
      <p className="text-label mb-4 text-mute-2">{nav.megaTitle}</p>
      <ul className="grid grid-cols-2 gap-x-6">
        {catalog.map((d, i) => (
          <li key={d.slug}>
            <Link
              to={`/uslugi/${d.slug}`}
              onClick={onClose}
              className="group/mi flex items-baseline gap-4 border-t border-line py-3 text-white transition-colors duration-(--t-fast) ease-soft hover:text-lime"
            >
              <span className="text-micro w-6 text-mute tabular-nums transition-colors duration-(--t-fast) group-hover/mi:text-lime">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 font-heading text-[20px] font-medium leading-tight tracking-[-0.02em]">{d.title}</span>
              <span className="text-micro text-mute-2">{d.count ? nav.positions(d.count) : ''}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/uslugi" onClick={onClose} className="link-underline mt-6 inline-flex items-center gap-2 text-small text-white">
        {nav.megaAll} <ArrowUpRight strokeWidth={1.5} className="size-4" />
      </Link>
    </motion.div>
  )
}

function OverlayLink({ to, label, index, onClick, children }: { to: string; label: string; index: number; onClick: () => void; children?: React.ReactNode }) {
  const [ref, run] = useScramble<HTMLSpanElement>(label)
  return (
    <li className="overflow-hidden">
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        exit={{ y: '110%' }}
        transition={{ duration: 0.9, ease: EXPO, delay: 0.08 + index * 0.06 }}
      >
      <NavLink
        to={to}
        end={to === "/"}
        onClick={onClick}
        onPointerEnter={run}
        onFocus={run}
        className={({ isActive }) => cn('text-display-xl flex items-baseline gap-4 py-1', isActive ? 'text-white' : 'text-mute hover:text-white')}
      >
        <span className="text-label text-mute-2 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
        <span ref={ref}>{label}</span>
      </NavLink>
      {children}
      </motion.div>
    </li>
  )
}

function Overlay({ id, onClose }: { id: string; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  // фокус на первый пункт при открытии, возврат на бургер при закрытии
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    root.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
    return () => prev?.focus({ preventScroll: true })
  }, [])
  return (
    <motion.div
      ref={root}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={nav.menuOpen}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      className="fixed inset-0 z-30 flex flex-col justify-end bg-void px-margin pb-12 pt-32"
    >
      <ul className="flex flex-col">
        {nav.links.map((l, i) => (
          <OverlayLink key={l.to} to={l.to} label={l.label} index={i} onClick={onClose}>
            {'mega' in l && l.mega && (
              <ul className="mb-4 mt-2 flex flex-wrap gap-x-4 gap-y-2 pl-9">
                {catalog.map((d) => (
                  <li key={d.slug}><Link to={`/uslugi/${d.slug}`} onClick={onClose} className="text-label text-mute-2 hover:text-white">{d.title}</Link></li>
                ))}
              </ul>
            )}
          </OverlayLink>
        ))}
      </ul>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="mt-12 flex flex-wrap items-center justify-between gap-6">
        <Button href={nav.cta.to} onClick={onClose}>{nav.cta.label}</Button>
        <p className="text-label text-mute-2">{site.slogan} · {site.city}</p>
      </motion.div>
    </motion.div>
  )
}

// гистерезис сжатия: вниз на 80px — сжать, вверх на 40px — раскрыть
const DOWN = 80
const UP = 40

/** Скролл из Lenis (или нативный), обработка раз в кадр; state меняется только при смене состояния */
function useCompactOnScroll() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    let last = window.scrollY, acc = 0, state = false, raf = 0
    const check = () => {
      raf = 0
      const y = window.scrollY
      const dy = y - last
      last = y
      if (!dy) return
      // путь копится в одном направлении, смена направления начинает отсчёт заново
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy
      let next = state
      if (y < DOWN) next = false
      else if (acc >= DOWN) next = true
      else if (acc <= -UP) next = false
      if (next !== state) { state = next; setCompact(next) }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check) }
    const lenis = getLenis()
    let off: () => void
    if (lenis) off = lenis.on('scroll', onScroll)
    else {
      window.addEventListener('scroll', onScroll, { passive: true })
      off = () => window.removeEventListener('scroll', onScroll)
    }
    return () => { off(); cancelAnimationFrame(raf) }
  }, [])
  return compact
}

/**
 * Навбар DESIGN.md §9: фиксированная пилюля liquid glass по центру сверху.
 * Скролл вниз — сжимается до лого + бургер, вверх — раскрывается. На мобиле всегда лого + бургер,
 * меню — полноэкранный оверлей с пунктами display-xl и glyph-scramble.
 * Сжатие без перерасчёта раскладки (FLIP): пилюля держит полную ширину, стеклянная подложка — отдельный
 * абсолютный слой (backdrop-filter не анимируется), пилюля сдвигается transform'ом к центру, пункты гаснут
 * opacity + сдвиг со stagger 30ms, бургер подъезжает к лого. Одна CSS-анимация 450ms, ease-out-expo.
 */
export function Nav() {
  const compact = useCompactOnScroll()
  const [menu, setMenu] = useState(false)
  const [mega, setMega] = useState(false)
  const megaId = useId(), menuId = useId()
  const { pathname } = useLocation()
  const wrap = useRef<HTMLDivElement>(null)
  const logo = useRef<HTMLDivElement>(null)
  const burger = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState({ cut: 0, dx: 0 })
  // hover-intent мега-меню: 150 мс на открытие, 250 мс на закрытие — не мигает при проходе мышью
  const hoverT = useRef(0)
  const openSoon = () => { clearTimeout(hoverT.current); hoverT.current = window.setTimeout(() => setMega(true), 150) }
  const closeSoon = () => { clearTimeout(hoverT.current); hoverT.current = window.setTimeout(() => setMega(false), 250) }

  // геометрия сжатого состояния: сколько ширины убрать у подложки и на сколько подвинуть бургер к лого
  useLayoutEffect(() => {
    const measure = () => {
      const w = wrap.current, l = logo.current, b = burger.current
      if (!w || !l || !b) return
      const logoEnd = l.offsetLeft + l.offsetWidth + 8
      const compactW = logoEnd + b.offsetWidth + 8
      setGeo({ cut: Math.max(0, w.offsetWidth - compactW), dx: Math.max(0, b.offsetLeft - logoEnd) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [])

  // закрытие при смене страницы, Escape и клике снаружи
  useEffect(() => { setMenu(false); setMega(false) }, [pathname])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); setMega(false) } }
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setMega(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onDown) }
  }, [])
  useEffect(() => {
    const lenis = getLenis()
    if (menu) { lenis?.stop(); document.documentElement.style.overflow = 'hidden' }
    else { lenis?.start(); document.documentElement.style.overflow = '' }
  }, [menu])
  useEffect(() => { if (compact) setMega(false) }, [compact])

  const expanded = !compact && !menu
  const vars = { '--cut': `${geo.cut}px`, '--dx': `${geo.dx}px` } as CSSProperties
  const off = expanded ? undefined : -1

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-margin">
        <div
          ref={wrap}
          data-compact={!expanded || undefined}
          style={vars}
          className="nav-pill pointer-events-auto relative flex h-16 items-center gap-2 rounded-pill pl-6 pr-2"
        >
          <div aria-hidden="true" className="nav-glass glass glass-nav absolute inset-0 rounded-pill" />
          <div ref={logo} className="relative"><Logo /></div>

          <nav aria-label="Основное меню" aria-hidden={!expanded || undefined} className="relative ml-8 hidden items-center gap-1 lg:flex">
            {nav.links.map((l, i) =>
              'mega' in l && l.mega ? (
                <div key={l.to} style={{ '--i': i } as CSSProperties} onPointerEnter={openSoon} onPointerLeave={closeSoon} className="nav-item flex items-center">
                  <NavLink
                    to={l.to}
                    tabIndex={off}
                    className={cn('rounded-pill py-2 pl-4 pr-1 text-small hover:text-white', mega || pathname.startsWith('/uslugi') ? 'text-white' : 'text-mute-2')}
                  >
                    {l.label}
                  </NavLink>
                  <button
                    type="button"
                    tabIndex={off}
                    aria-label={nav.megaToggle}
                    aria-expanded={mega}
                    aria-controls={megaId}
                    onClick={() => { clearTimeout(hoverT.current); setMega((v) => !v) }}
                    className="mr-2 grid size-7 place-items-center rounded-full text-mute-2 transition-colors duration-(--t-fast) hover:bg-white/10 hover:text-white"
                  >
                    <ChevronDown strokeWidth={1.5} className={cn('size-4 transition-transform duration-(--t-base) ease-out-expo', mega && 'rotate-180')} />
                  </button>
                </div>
              ) : (
                <NavLink key={l.to} to={l.to} end={l.to === "/"} tabIndex={off} style={{ '--i': i } as CSSProperties} className={({ isActive }) => cn('nav-item rounded-pill px-4 py-2 text-small hover:text-white', isActive ? 'text-white' : 'text-mute-2')}>
                  {l.label}
                </NavLink>
              ),
            )}
          </nav>

          <div aria-hidden={!expanded || undefined} className="nav-item relative ml-6 hidden lg:block" style={{ '--i': nav.links.length } as CSSProperties}>
            <Button href={nav.cta.to} size="compact" tabIndex={off}>{nav.cta.label}</Button>
          </div>

          {/* на десктопе бургер лежит у правого края под CTA и появляется только в сжатом состоянии */}
          <div ref={burger} className="nav-burger relative ml-2 lg:absolute lg:right-2 lg:top-2.5 lg:ml-0">
            <Burger open={menu} onClick={() => setMenu((v) => !v)} controls={menuId} />
          </div>

          <AnimatePresence>{mega && expanded && <MegaMenu id={megaId} onClose={() => setMega(false)} onEnter={openSoon} onLeave={closeSoon} />}</AnimatePresence>
        </div>
      </header>
      <AnimatePresence>{menu && <Overlay id={menuId} onClose={() => setMenu(false)} />}</AnimatePresence>
    </>
  )
}
