import { useEffect } from 'react'

/*
 * Liquid Glass (DESIGN.md §7.1): SVG feDisplacementMap (refraction 32, bezel 32) + backdrop-filter
 * blur(2px) saturate(1.4) brightness(1.05), блики inset-тенями. Карта смещения: красный канал — сдвиг по X,
 * зелёный — по Y, нейтральный серый в центре, искажение только у краёв (bezel).
 * Фолбэк без SVG-фильтров в backdrop-filter (Safari, Firefox): blur(10px) + полупрозрачная белая заливка.
 * Применяется только к кнопкам, навбару, полям формы и плашкам поверх 3D (класс .glass).
 * Промт 21st.dev apple-tahoe-liquid-glass-button в prompts/ пока не добавлен — реализация по DESIGN.md.
 */
const BEZEL = 32
const map = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'>
<defs>
<linearGradient id='x' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>
<linearGradient id='y' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>
<filter id='b'><feGaussianBlur stdDeviation='${BEZEL / 3}'/></filter>
</defs>
<rect width='256' height='256' fill='url(#x)'/>
<rect width='256' height='256' fill='url(#y)' style='mix-blend-mode:screen'/>
<rect x='${BEZEL}' y='${BEZEL}' width='${256 - BEZEL * 2}' height='${256 - BEZEL * 2}' rx='${BEZEL}' fill='#808000' filter='url(#b)'/>
</svg>`
const MAP_URL = `data:image/svg+xml,${encodeURIComponent(map)}`

/** Один общий SVG-фильтр на страницу. Рендерится в Layout. */
export function GlassFilter() {
  useEffect(() => {
    // url()-фильтры в backdrop-filter стабильно работают только в Chromium
    const ua = navigator.userAgent
    const chromium = /Chrome\/|Edg\//.test(ua) && !/Firefox\//.test(ua)
    if (chromium && CSS.supports('backdrop-filter', 'url(#de-liquid)')) document.documentElement.classList.add('glass-svg')
  }, [])
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <filter id="de-liquid" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage href={MAP_URL} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={32} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}
