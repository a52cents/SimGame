import { useEffect, useRef } from 'react'

function InfoPanel({ open, onClose, triggerRef }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open, triggerRef])

  if (!open) return null

  const handleClose = () => {
    onClose()
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <aside
      id="information-panel"
      className="information-panel glass-panel"
      aria-labelledby="information-title"
    >
      <div className="information-panel__header">
        <div>
          <span className="panel-eyebrow">Carnet d’exploration</span>
          <h2 id="information-title">Comment lire cette carte</h2>
        </div>
        <button
          ref={closeButtonRef}
          className="icon-button"
          type="button"
          onClick={handleClose}
          aria-label="Fermer le panneau d’informations"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="information-panel__body">
        <section>
          <span className="information-panel__index">01</span>
          <div>
            <h3>Un relief issu du bruit de Perlin</h3>
            <p>
              Plusieurs fréquences de bruit cohérent sont combinées pour produire
              de grandes masses terrestres et des détails locaux. La seed rend chaque
              monde reproductible pendant toute la session.
            </p>
          </div>
        </section>
        <section>
          <span className="information-panel__index">02</span>
          <div>
            <h3>Sept biomes par altitude</h3>
            <p>
              Eaux profondes, côtes, rivages, prairies, forêts, montagnes et neige
              se succèdent selon l’élévation. Une atténuation aux limites forme des
              littoraux naturels et maintient une carte lisible.
            </p>
          </div>
        </section>
        <section>
          <span className="information-panel__index">03</span>
          <div>
            <h3>Des ressources liées au terrain</h3>
            <p>
              Le bois apparaît dans les prairies et les forêts, la pierre sur les
              reliefs montagneux ou enneigés, et l’eau dans les zones côtières. Une
              distance minimale évite les amas artificiels.
            </p>
          </div>
        </section>
        <section>
          <span className="information-panel__index">04</span>
          <div>
            <h3>Contrôles</h3>
            <ul>
              <li>Glissez à la souris ou au doigt pour parcourir le monde.</li>
              <li>Utilisez la molette, le pincement ou les boutons + et −.</li>
              <li>Au clavier : flèches, +, − et 0 pour revenir au départ.</li>
              <li>Sélectionnez une ressource pour afficher ses détails.</li>
            </ul>
          </div>
        </section>
      </div>
    </aside>
  )
}

export default InfoPanel
