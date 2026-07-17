import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const EDGE_MARGIN = 14
const ANCHOR_GAP = 22

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum)

function ResourcePopup({ data, containerRef, onClose }) {
  const popupRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [placement, setPlacement] = useState(null)

  useLayoutEffect(() => {
    if (!data || !popupRef.current || !containerRef.current) return undefined

    const updatePlacement = () => {
      const container = containerRef.current
      const popup = popupRef.current
      if (!container || !popup) return

      const popupWidth = popup.offsetWidth
      const popupHeight = popup.offsetHeight
      const halfWidth = popupWidth / 2
      const left = clamp(
        data.anchor.x,
        halfWidth + EDGE_MARGIN,
        container.clientWidth - halfWidth - EDGE_MARGIN,
      )
      const fitsAbove = data.anchor.y - popupHeight - ANCHOR_GAP > EDGE_MARGIN
      const top = fitsAbove
        ? data.anchor.y - ANCHOR_GAP
        : clamp(
            data.anchor.y + ANCHOR_GAP,
            EDGE_MARGIN,
            container.clientHeight - popupHeight - EDGE_MARGIN,
          )

      setPlacement({ left, top, direction: fitsAbove ? 'above' : 'below' })
    }

    updatePlacement()
    const resizeObserver = new ResizeObserver(updatePlacement)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [containerRef, data])

  useEffect(() => {
    if (!data) return undefined

    const previouslyFocused = document.activeElement
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const handleOutsidePress = (event) => {
      if (!popupRef.current?.contains(event.target)) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handleOutsidePress)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handleOutsidePress)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [data, onClose])

  if (!data) return null

  const popupStyle = placement
    ? {
        left: `${placement.left}px`,
        top: `${placement.top}px`,
        transform:
          placement.direction === 'above'
            ? 'translate(-50%, -100%)'
            : 'translate(-50%, 0)',
        visibility: 'visible',
      }
    : { visibility: 'hidden' }

  return (
    <section
      ref={popupRef}
      className="resource-popup"
      style={popupStyle}
      role="dialog"
      aria-modal="false"
      aria-labelledby="resource-popup-title"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="resource-popup__eyebrow">Ressource repérée</div>
      <div className="resource-popup__heading">
        <img src={data.icon} alt="" aria-hidden="true" />
        <div>
          <h2 id="resource-popup-title">{data.label}</h2>
          <p>{data.quantity} unités disponibles</p>
        </div>
      </div>
      <dl className="resource-popup__coordinates">
        <div>
          <dt>Coordonnée X</dt>
          <dd>{Math.round(data.position.x)}</dd>
        </div>
        <div>
          <dt>Coordonnée Y</dt>
          <dd>{Math.round(data.position.y)}</dd>
        </div>
      </dl>
      <button
        ref={closeButtonRef}
        className="resource-popup__close"
        type="button"
        onClick={onClose}
      >
        Fermer
      </button>
    </section>
  )
}

export default ResourcePopup
