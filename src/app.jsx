import React, { useEffect, useState, useRef } from 'react'

const BUTTON_COUNT = 500

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export default function App() {
  const [buttons, setButtons] = useState([])
  const [screen, setScreen] = useState('home') // 'home' | 'cards' | 'free' | 'paid'
  const resizeTid = useRef(null)

  const generateRandomButtons = () => {
    const w = window.innerWidth
    const h = window.innerHeight

    const arr = Array.from({ length: BUTTON_COUNT }).map((_, i) => {
      const width = Math.round(randomBetween(70, 180))
      const height = Math.round(randomBetween(28, 56))
      const left = Math.round(randomBetween(6, Math.max(6, w - width - 6)))
      const top = Math.round(randomBetween(6, Math.max(6, h - height - 6)))
      const rotate = Math.round(randomBetween(-18, 18))
      const opacity = Number(randomBetween(0.6, 1).toFixed(2))
      const scale = Number(randomBetween(0.85, 1.12).toFixed(2))

      return {
        id: `btn-${i}-${Date.now()}`,
        left,
        top,
        width,
        height,
        rotate,
        opacity,
        scale
      }
    })

    setButtons(arr)
  }

  useEffect(() => {
    generateRandomButtons()

    const onResize = () => {
      if (resizeTid.current) clearTimeout(resizeTid.current)
      resizeTid.current = setTimeout(() => {
        generateRandomButtons()
        resizeTid.current = null
      }, 120)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      if (resizeTid.current) clearTimeout(resizeTid.current)
    }
  }, [])

  // NAV
  const goToCards = () => setScreen('cards')
  const onClickFree = () => setScreen('free')
  const onClickPaid = () => setScreen('paid')

  const handleRandomClick = (id, e) => {
    e.stopPropagation()
    console.log('Random button clicked:', id)
    const el = e.currentTarget
    el.dataset.clicked = '1'
    setTimeout(() => { el.dataset.clicked = '0' }, 140)
  }

  // FREE screen animation refs
  const floatContainerRef = useRef(null)
  const floatsRef = useRef([]) // mutable array of float items
  const animationRef = useRef(null)
  const alignProgressRef = useRef(0) // stable ref for RAF loop
  const [showLetsGo, setShowLetsGo] = useState(false) // show button only after alignment complete

  useEffect(() => {
    // only initialize when entering free screen
    if (screen !== 'free') return

    // texts (you replaced them with poem lines — kept as-is)
    const texts = [
      'If Vodka were water, and i were a duck;',
      'I would swim under water and never come up;',
      'But Vodka is not water, and I am not a duck;',
      'So hand me the bottle and shut the fuck up!'
    ]

    // initialize floats
    const W = window.innerWidth
    const H = window.innerHeight
    const items = texts.map((t, i) => ({
      id: `float-${i}-${Date.now()}`,
      text: t,
      x: randomBetween(40, Math.max(40, W - 200)),
      y: randomBetween(40, Math.max(40, H - 120)),
      vx: randomBetween(-0.6, 0.6),
      vy: randomBetween(-0.45, 0.45),
      size: Math.round(randomBetween(18, 32)),
    }))
    floatsRef.current = items

    // reset progress & button
    alignProgressRef.current = 0
    setShowLetsGo(false)

    // timing
    const driftStart = 3500
    const driftEnd = 5000
    let startTime = performance.now()

    // compute targets for current viewport
    function computeTargets() {
      const nodes = floatContainerRef.current?.children || []
      const W2 = window.innerWidth
      const H2 = window.innerHeight
      const targets = []

      floatsRef.current.forEach((it, idx) => {
        const node = nodes[idx]
        const nodeW = node ? node.offsetWidth : 180
        const nodeH = node ? node.offsetHeight : 32
        const gap = Math.max(46, nodeH + 10)
        const totalH = floatsRef.current.length * gap
        const startY = Math.round(H2 / 2 - totalH / 2)
        const targetX = Math.round(W2 / 2 - nodeW / 2)
        const targetY = startY + idx * gap
        targets.push({ targetX, targetY })
      })

      return targets
    }

    // apply final positions when fully aligned or on resize after alignment
    function applyFinalPositions() {
      const nodes = floatContainerRef.current?.children || []
      const targets = computeTargets()
      targets.forEach((t, idx) => {
        const node = nodes[idx]
        if (node) {
          node.style.transform = `translate(${Math.round(t.targetX)}px, ${Math.round(t.targetY)}px)`
        }
        const it = floatsRef.current[idx]
        if (it) {
          it.x = t.targetX
          it.y = t.targetY
          it.vx = 0
          it.vy = 0
        }
      })
    }

    // resize handler — if already aligned, re-center
    const onResizeDuringFree = () => {
      if (alignProgressRef.current >= 1) {
        // small delay to allow layout reflow
        setTimeout(() => applyFinalPositions(), 30)
      }
    }

    // main animation loop
    const tick = (now) => {
      const elapsed = now - startTime

      // update align progress (ref only)
      if (elapsed >= driftStart) {
        const p = Math.min((elapsed - driftStart) / (driftEnd - driftStart), 1)
        alignProgressRef.current = p
        if (p >= 1) {
          // reveal Let's Go once (calling setState repeatedly is fine — React handles it)
          setShowLetsGo(true)
        }
      }

      const nodes = floatContainerRef.current?.children || []
      const W2 = window.innerWidth
      const H2 = window.innerHeight

      // compute targets for consistent positions this frame
      const targets = computeTargets()

      floatsRef.current.forEach((it, idx) => {
        const ease = alignProgressRef.current // 0..1, from ref

        // free-floating when not fully aligned
        if (ease < 1) {
          it.x += it.vx
          it.y += it.vy

          const pad = 20
          if (it.x < pad) { it.x = pad; it.vx *= -1 }
          if (it.y < pad) { it.y = pad; it.vy *= -1 }
          if (it.x > W2 - pad - 200) { it.x = W2 - pad - 200; it.vx *= -1 }
          if (it.y > H2 - pad - 60) { it.y = H2 - pad - 60; it.vy *= -1 }
        }

        const target = targets[idx] || { targetX: it.x, targetY: it.y }
        // lerp between current (it.x/it.y) and target by ease
        const x = it.x * (1 - ease) + target.targetX * ease
        const y = it.y * (1 - ease) + target.targetY * ease

        const node = nodes[idx]
        if (node) {
          node.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
        }

        // when almost finished, lock model positions
        if (ease >= 0.995) {
          it.x = target.targetX
          it.y = target.targetY
          it.vx = 0
          it.vy = 0
        }
      })

      animationRef.current = requestAnimationFrame(tick)
    }

    animationRef.current = requestAnimationFrame(tick)
    window.addEventListener('resize', onResizeDuringFree)

    // cleanup when leaving free screen
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      floatsRef.current = []
      window.removeEventListener('resize', onResizeDuringFree)
      setShowLetsGo(false)
    }
  }, [screen]) // only re-run when screen changes

  // RENDER
  if (screen === 'home') {
    return (
      <main className="stage random-stage">
        <div className="center-play">
          <button className="play-btn large" onClick={() => setScreen('cards')}>
            <span className="btn-text">Let&apos;s Play</span>
          </button>
        </div>

        <div className="random-layer">
          {buttons.map(b => (
            <button
              key={b.id}
              className="play-btn small"
              style={{
                position: 'absolute',
                left: b.left,
                top: b.top,
                width: b.width,
                height: b.height,
                transform: `rotate(${b.rotate}deg) scale(${b.scale})`,
                opacity: b.opacity,
                zIndex: 5
              }}
              onClick={(e) => handleRandomClick(b.id, e)}
            >
              <span className="btn-text" style={{ fontSize: Math.max(10, Math.round(b.height * 0.45)) }}>
                Let&apos;s Play
              </span>
            </button>
          ))}
        </div>
      </main>
    )
  }

  if (screen === 'cards') {
    return (
      <div className="next-screen">
        <div className="card-container">
          <div className="card">
            <h2 className="card-title">FREE</h2>
            <button className="card-btn" onClick={onClickFree}>FREE</button>
            <p className="card-description">
              This is the free version with limited features.
            </p>
          </div>

          <div className="card">
            <h2 className="card-title">PAID</h2>
            <button className="card-btn" onClick={onClickPaid}>PAID</button>
            <p className="card-description">
              Unlock all premium features with the paid plan.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'free') {
    return (
      <div className="free-screen">
        <div className="free-float-container" ref={floatContainerRef} aria-hidden="false">
          {floatsRef.current.length > 0
            ? floatsRef.current.map(it => (
                <div
                  key={it.id}
                  className="float-text"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    fontSize: `${it.size}px`,
                    transform: `translate(${Math.round(it.x)}px,${Math.round(it.y)}px)`
                  }}
                >
                  {it.text}
                </div>
              ))
            : (
              ['If Vodka were water and i were a duck','I would swim under water and never come up','But vodka is not water and i am not a duck','So hand me the bottle and shut the fuck up'].map((t,i) => (
                <div key={`ph-${i}`} className="float-text" style={{ position: 'absolute', left: 20 + i*30, top: 80 + i*40 }}>
                  {t}
                </div>
              ))
            )
          }
        </div>

        <div className="free-bottom">
          <button
            className={`letsgo-btn ${showLetsGo ? 'show' : ''}`}
            onClick={() => console.log("Let's go clicked (free)")}
            aria-hidden={!showLetsGo}
            disabled={!showLetsGo}
          >
            Let&apos;s Go
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'paid') {
    return (
      <div className="paid-screen">
        <div className="paid-center">
          <h2 style={{ color: 'white', marginBottom: 18 }}>PAID PLAN</h2>
          <p style={{ color: 'white', opacity: 0.9, marginBottom: 24 }}>Paid flow — unlock everything.</p>
          <button className="card-btn" onClick={() => console.log('Paid continue')}>
            Proceed
          </button>
        </div>
      </div>
    )
  }

  return null
}
