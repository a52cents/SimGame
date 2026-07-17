import { forwardRef } from 'react'

function ControlIcon({ name }) {
  const paths = {
    refresh: (
      <>
        <path d="M19 7v4h-4" />
        <path d="M18.2 11a7 7 0 1 0 .2 5" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    reset: (
      <>
        <path d="M4 12a8 8 0 1 0 2.34-5.66L4 8.68" />
        <path d="M4 4v4.68h4.68" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6" />
        <path d="M12 7.5h.01" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  )
}

const MapControls = forwardRef(function MapControls(
  {
    isGenerating,
    isInfoOpen,
    onNewMap,
    onZoomIn,
    onZoomOut,
    onResetView,
    onToggleInfo,
  },
  infoButtonRef,
) {
  return (
    <nav className="map-controls glass-panel" aria-label="Contrôles de la carte">
      <button
        className="control-button control-button--primary"
        type="button"
        onClick={onNewMap}
        disabled={isGenerating}
        aria-label="Générer une nouvelle carte"
      >
        <ControlIcon name="refresh" />
        <span className="control-button__label">
          {isGenerating ? 'Génération…' : 'Nouvelle carte'}
        </span>
      </button>
      <span className="map-controls__divider" aria-hidden="true" />
      <button
        className="control-button"
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom avant"
        title="Zoom avant (+)"
      >
        <ControlIcon name="plus" />
        <span className="control-button__label control-button__label--desktop">
          Zoom avant
        </span>
      </button>
      <button
        className="control-button"
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom arrière"
        title="Zoom arrière (−)"
      >
        <ControlIcon name="minus" />
        <span className="control-button__label control-button__label--desktop">
          Zoom arrière
        </span>
      </button>
      <button
        className="control-button"
        type="button"
        onClick={onResetView}
        aria-label="Réinitialiser la vue"
        title="Réinitialiser la vue (0)"
      >
        <ControlIcon name="reset" />
        <span className="control-button__label control-button__label--desktop">
          Vue initiale
        </span>
      </button>
      <button
        ref={infoButtonRef}
        className="control-button"
        type="button"
        onClick={onToggleInfo}
        aria-label={
          isInfoOpen
            ? 'Masquer les informations'
            : 'Afficher les informations'
        }
        aria-expanded={isInfoOpen}
        aria-controls="information-panel"
        title="Informations"
      >
        <ControlIcon name="info" />
        <span className="control-button__label control-button__label--desktop">
          Informations
        </span>
      </button>
    </nav>
  )
})

export default MapControls
