import React, { useEffect, useState, useRef } from 'react'

const MAX_PROMPTS = 10

// timing presets (label, seconds)
const TIMING_PRESETS = [
  { id: '6',   label: '6s',   name: 'Micro',   seconds: 6 },
  { id: '15',  label: '15s',  name: 'Reel',    seconds: 15 },
  { id: '30',  label: '30s',  name: 'Clip',    seconds: 30 },
  { id: '60',  label: '60s',  name: 'Short',   seconds: 60 },
  { id: '120', label: '120s', name: 'Long',    seconds: 120 },
  { id: '300', label: '300s', name: 'Epic',    seconds: 300 }
]

export default function App() {
  // nav / routing
  const [screen, setScreen] = useState('home') // home | cards | create | paid

  // CREATE screen core
  const [remaining, setRemaining] = useState(MAX_PROMPTS)
  const [bookName, setBookName] = useState('')
  const [results, setResults] = useState([])

  // Edit options (Card B)
  const [videoQuality, setVideoQuality] = useState('1080p')
  const [audioQuality, setAudioQuality] = useState('Standard')
  const [lengthSec, setLengthSec] = useState(30) // default to 30s
  const [format, setFormat] = useState('MP4')
  const [captions, setCaptions] = useState(true)
  const [cinematicGrade, setCinematicGrade] = useState(true)

  // nav / dropdown
  const [navOpen, setNavOpen] = useState(false)
  const [showHistoryInDropdown, setShowHistoryInDropdown] = useState(false)
  const navRef = useRef(null)

  // neon brand entrance
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    if (screen === 'create') {
      const t = setTimeout(() => setEntered(true), 160)
      return () => clearTimeout(t)
    } else {
      setEntered(false)
    }
  }, [screen])

  // close dropdown when clicking outside or Escape
  useEffect(() => {
    function onDocClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNavOpen(false)
        setShowHistoryInDropdown(false)
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setNavOpen(false)
        setShowHistoryInDropdown(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // navigation handlers
  const goToCards = () => setScreen('cards')
  const goToCreate = () => {
    setBookName('')
    setResults([])
    setRemaining(MAX_PROMPTS)
    setScreen('create')
  }
  const goToPaid = () => setScreen('paid')

  // generate handler
  const handleGenerate = () => {
    if (!bookName.trim()) return
    if (remaining <= 0) return

    const entry = {
      id: `r-${Date.now()}`,
      prompt: bookName.trim(),
      time: new Date().toLocaleTimeString(),
      options: {
        videoQuality,
        audioQuality,
        lengthSec,
        format,
        captions,
        cinematicGrade
      }
    }

    setResults(prev => [entry, ...prev])
    setRemaining(r => Math.max(0, r - 1))
    setBookName('')
  }

  const goBackFromCreate = () => setScreen('cards')

  // NAV actions
  const onHistoryClick = () => setShowHistoryInDropdown(s => !s)
  const onSettingsClick = () => { setNavOpen(false); setShowHistoryInDropdown(false); alert('Settings placeholder') }
  const onSubscriptionClick = () => { setScreen('paid'); setNavOpen(false); setShowHistoryInDropdown(false) }

  // chosen preset helper
  const handlePresetClick = (seconds) => {
    setLengthSec(seconds)
  }

  // render nav (only on create screen)
  const renderNav = () => (
    <header className={`top-nav ${screen === 'create' ? 'large' : ''}`} role="banner">
      <div className="nav-inner">
        <div className="nav-left" />
        <div className={`brand neon ${entered ? 'show' : ''}`} aria-hidden="true">
          <span className="letter v" data-char="V">V</span>
          <span className="letter b" data-char="B">B</span>
          <span className="letter o-small" data-char="O">O</span>
          <span className="letter o-mid" data-char="O">O</span>
          <span className="letter k" data-char="K">K</span>
        </div>

        <div className="nav-right" ref={navRef}>
          <button
            className="profile-btn"
            aria-haspopup="true"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(v => !v)}
            title="Profile"
          >
            <div className="avatar"><span className="avatar-initials">VK</span></div>
          </button>

          {navOpen && (
            <div className="profile-dropdown" role="menu" aria-label="Profile menu">
              <div className="profile-header">
                <div className="header-avatar"><div className="avatar avatar-lg"><span className="avatar-initials">VK</span></div></div>
                <div className="header-meta">
                  <div className="header-name">You</div>
                  <div className="header-sub">vbook@local</div>
                </div>
              </div>

              <div className="dropdown-items">
                <button className="drop-item" onClick={onHistoryClick}><span className="icon">🕘</span> History</button>
                <button className="drop-item" onClick={onSettingsClick}><span className="icon">⚙️</span> Settings</button>
                <button className="drop-item" onClick={onSubscriptionClick}><span className="icon">💳</span> Subscription</button>
              </div>

              {showHistoryInDropdown && (
                <div className="history-list" role="region" aria-label="Prompt history">
                  {results.length === 0 ? (
                    <div className="history-empty">No history yet</div>
                  ) : (
                    results.map(r => (
                      <div key={r.id} className="history-row">
                        <div className="history-time">{r.time}</div>
                        <div className="history-text">{r.prompt}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )

  // main render
  return (
    <div className="app-shell">
      {screen === 'create' && renderNav()}

      {/* HOME */}
      {screen === 'home' && (
        <main className="stage home-stage">
          <div className="center-play">
            <button className="play-btn large" onClick={goToCards}>Let's Play</button>
          </div>
        </main>
      )}

      {/* CARDS */}
      {screen === 'cards' && (
        <div className="next-screen">
          <div className="card-container">
            <div className="card">
              <h2 className="card-title">FREE</h2>
              <button className="card-btn free-btn" onClick={goToCreate}>FREE</button>
              <p className="card-description">Free: Create with default options (limited prompts).</p>
            </div>

            <div className="card">
              <h2 className="card-title">PAID</h2>
              <button className="card-btn paid-btn" onClick={() => setScreen('paid')}>PAID</button>
              <p className="card-description">Paid: unlock more prompts and higher quality exports.</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE */}
      {screen === 'create' && (
        <div className="create-screen with-nav">
          <div className="create-inner two-column">
            {/* Card A */}
            <div className="card card-a">
              <div className="card-a-header">
                <label className="label">Input your book name</label>
                <div className="remaining">Remaining: <strong>{remaining}</strong></div>
              </div>

              <textarea
                className="input-bookname"
                placeholder="Type book name here..."
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                rows={3}
                maxLength={200}
              />

              <div style={{ marginTop: 12 }}>
                <button
                  className="card-btn generate-btn"
                  onClick={handleGenerate}
                  disabled={!bookName.trim() || remaining <= 0}
                >
                  Generate
                </button>
                <button className="ghost-btn small" style={{ marginLeft: 10 }} onClick={() => setBookName('')}>Reset</button>
              </div>
            </div>

            {/* Card B: Edit Options */}
            <div className="card card-b">
              <h3 className="card-b-title">Edit Options</h3>

              <div className="control-row">
                <label>Video quality</label>
                <select value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)} className="control-select">
                  <option value="480p">480p (Low)</option>
                  <option value="720p">720p (SD)</option>
                  <option value="1080p">1080p (HD)</option>
                  <option value="4k">4K (Ultra)</option>
                </select>
              </div>

              <div className="control-row">
                <label>Audio quality</label>
                <select value={audioQuality} onChange={(e) => setAudioQuality(e.target.value)} className="control-select">
                  <option>Low</option>
                  <option>Standard</option>
                  <option>High</option>
                </select>
              </div>

              {/* NEW: discrete timing presets */}
              <div className="control-row">
                <label>Length (preset)</label>
                <div className="timing-presets" role="tablist" aria-label="Timing presets">
                  {TIMING_PRESETS.map(p => {
                    const active = lengthSec === p.seconds
                    return (
                      <button
                        key={p.id}
                        className={`preset-btn ${active ? 'active' : ''}`}
                        onClick={() => handlePresetClick(p.seconds)}
                        aria-pressed={active}
                        title={`${p.label} — ${p.name}`}
                      >
                        <div className="preset-label">{p.label}</div>
                        <div className="preset-sub">{p.name}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="control-row">
                <label>Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="control-select">
                  <option>MP4</option>
                  <option>WEBM</option>
                  <option>MOV</option>
                </select>
              </div>

              <div className="control-row checkbox-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={captions} onChange={(e) => setCaptions(e.target.checked)} />
                  <span>Include captions</span>
                </label>
              </div>

              <div className="control-row checkbox-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={cinematicGrade} onChange={(e) => setCinematicGrade(e.target.checked)} />
                  <span>Use cinematic color grade</span>
                </label>
              </div>

              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                Tip: choose a timing preset to match the platform you target.
              </div>
            </div>

            {/* Results area below */}
            <div className="results-panel" style={{ gridColumn: '1 / -1' }}>
              <div style={{ marginTop: 18 }}>
                <h4 style={{ margin: '8px 0 10px' }}>Generations</h4>
                {results.length === 0 ? (
                  <div className="muted">No generations yet — your generated items will appear here.</div>
                ) : (
                  results.map(r => (
                    <div key={r.id} className="result-card">
                      <div className="result-meta">{r.time}</div>
                      <div className="result-text">{r.prompt}</div>
                      <div className="result-options">
                        <small>Video: {r.options.videoQuality} • Audio: {r.options.audioQuality} • {r.options.lengthSec}s • {r.options.format}</small>
                        <div style={{ fontSize: 13, marginTop: 6 }}>
                          {r.options.captions ? 'Captions • ' : ''}{r.options.cinematicGrade ? 'Cinematic Grade' : ''}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAID */}
      {screen === 'paid' && (
        <div className="paid-screen">
          <div className="paid-center">
            <h2 style={{ color: 'white', marginBottom: 18 }}>PAID PLAN</h2>
            <p style={{ color: 'white', opacity: 0.9, marginBottom: 24 }}>Paid flow — unlock everything.</p>
            <button className="card-btn" onClick={() => { setRemaining(MAX_PROMPTS); setScreen('create') }}>
              Purchase (demo)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
