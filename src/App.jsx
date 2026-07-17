import { useCallback, useRef, useState } from 'react'
import InfoPanel from './components/InfoPanel'
import Legend from './components/Legend'
import MapControls from './components/MapControls'
import TerrainCanvas from './components/TerrainCanvas'
import { createSeed, formatSeed } from './utils/terrain'
import './App.css'

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="20" />
      <path d="m29 19-3.2 6.8L19 29l3.2-6.8L29 19Z" />
      <path d="M24 7v4M24 37v4M7 24h4M37 24h4" />
    </svg>
  )
}

function App() {
  const terrainRef = useRef(null)
  const infoButtonRef = useRef(null)
  const [seed, setSeed] = useState(() => createSeed())
  const [isGenerating, setIsGenerating] = useState(true)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [resourceCount, setResourceCount] = useState(0)

  const handleNewMap = useCallback(() => {
    setIsGenerating(true)
    setSeed((currentSeed) => {
      let nextSeed = createSeed()
      while (nextSeed === currentSeed) nextSeed = createSeed()
      return nextSeed
    })
  }, [])

  const handleMapReady = useCallback((nextResourceCount) => {
    setResourceCount(nextResourceCount)
    setIsGenerating(false)
  }, [])

  const closeInfoPanel = useCallback(() => setIsInfoOpen(false), [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <BrandMark />
          <div>
            <div className="app-kicker">Exploration procédurale</div>
            <h1>Atlas des Brumes</h1>
          </div>
        </div>
        <p className="app-introduction">
          Explorez un monde unique, façonné par le relief et ses ressources.
        </p>
        <div className="app-tech" aria-label="Technologies utilisées">
          <span>React</span>
          <span aria-hidden="true">•</span>
          <span>p5.js</span>
        </div>
      </header>

      <main className="map-area">
        <section className="map-frame" aria-label="Explorateur de carte procédurale">
          <TerrainCanvas ref={terrainRef} seed={seed} onReady={handleMapReady} />
          <div className="map-frame__shade" aria-hidden="true" />

          <MapControls
            ref={infoButtonRef}
            isGenerating={isGenerating}
            isInfoOpen={isInfoOpen}
            onNewMap={handleNewMap}
            onZoomIn={() => terrainRef.current?.zoomIn()}
            onZoomOut={() => terrainRef.current?.zoomOut()}
            onResetView={() => terrainRef.current?.resetView()}
            onToggleInfo={() => setIsInfoOpen((open) => !open)}
          />

          <div className="seed-badge glass-panel" aria-live="polite">
            <span>Seed</span>
            <code>{formatSeed(seed)}</code>
          </div>

          <Legend />

          <div className="map-hint glass-panel" aria-hidden="true">
            <span className="map-hint__mouse">↖</span>
            Glissez pour explorer · Molette pour zoomer
          </div>

          <div className="sr-only" aria-live="polite">
            {isGenerating
              ? 'Génération de la carte en cours'
              : `Carte prête avec ${resourceCount} ressources`}
          </div>

          {isGenerating && (
            <div className="generation-status" role="status">
              <span className="generation-status__spinner" aria-hidden="true" />
              <span>La carte prend forme…</span>
            </div>
          )}

          <InfoPanel
            open={isInfoOpen}
            onClose={closeInfoPanel}
            triggerRef={infoButtonRef}
          />
        </section>
      </main>
    </div>
  )
}

export default App
