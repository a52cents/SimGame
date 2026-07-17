import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import p5 from 'p5'
import resources from '../utils/resources'
import {
  clamp,
  createResourceItems,
  createTerrainTexture,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../utils/terrain'
import ResourcePopup from './ResourcePopup'
import './TerrainCanvas.css'

const ZOOM_STEP = 1.24
const KEYBOARD_PAN_DISTANCE = 88

const TerrainCanvas = forwardRef(function TerrainCanvas({ seed, onReady }, ref) {
  const rootRef = useRef(null)
  const mountRef = useRef(null)
  const canvasApiRef = useRef(null)
  const [popupData, setPopupData] = useState(null)

  const closePopup = useCallback(() => setPopupData(null), [])

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => canvasApiRef.current?.zoomBy(ZOOM_STEP),
      zoomOut: () => canvasApiRef.current?.zoomBy(1 / ZOOM_STEP),
      resetView: () => canvasApiRef.current?.resetView(),
      focus: () => canvasApiRef.current?.focus(),
    }),
    [],
  )

  useEffect(() => {
    let instance
    let disposed = false
    let resizeObserver
    let resizeFrame = 0

    setPopupData(null)

    const sketch = (p) => {
      let canvas
      let terrainTexture
      let resourceItems = []
      let loadedIcons = {}
      let fitZoom = 1
      let resizeWidth = 0
      let resizeHeight = 0
      let gesture = null
      let pinch = null
      let pinchingOccurred = false
      const activePointers = new Map()
      const camera = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 1 }

      const requestDraw = () => {
        if (!disposed) p.redraw()
      }

      const canvasCoordinates = (event) => {
        const bounds = canvas.elt.getBoundingClientRect()
        return {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        }
      }

      const screenToWorld = (screenX, screenY, zoom = camera.zoom) => ({
        x: camera.x + (screenX - p.width / 2) / zoom,
        y: camera.y + (screenY - p.height / 2) / zoom,
      })

      const worldToScreen = (position) => ({
        x: (position.x - camera.x) * camera.zoom + p.width / 2,
        y: (position.y - camera.y) * camera.zoom + p.height / 2,
      })

      const getFitZoom = () =>
        Math.max(p.width / WORLD_WIDTH, p.height / WORLD_HEIGHT) * 1.006

      const getMaximumZoom = () => fitZoom * 4

      const clampCamera = () => {
        const halfViewWidth = p.width / (2 * camera.zoom)
        const halfViewHeight = p.height / (2 * camera.zoom)
        camera.x =
          halfViewWidth >= WORLD_WIDTH / 2
            ? WORLD_WIDTH / 2
            : clamp(camera.x, halfViewWidth, WORLD_WIDTH - halfViewWidth)
        camera.y =
          halfViewHeight >= WORLD_HEIGHT / 2
            ? WORLD_HEIGHT / 2
            : clamp(camera.y, halfViewHeight, WORLD_HEIGHT - halfViewHeight)
      }

      const resetView = () => {
        fitZoom = getFitZoom()
        camera.x = WORLD_WIDTH / 2
        camera.y = WORLD_HEIGHT / 2
        camera.zoom = fitZoom
        setPopupData(null)
        requestDraw()
      }

      const zoomAt = (nextZoom, screenX = p.width / 2, screenY = p.height / 2) => {
        const anchor = screenToWorld(screenX, screenY)
        camera.zoom = clamp(nextZoom, fitZoom, getMaximumZoom())
        camera.x = anchor.x - (screenX - p.width / 2) / camera.zoom
        camera.y = anchor.y - (screenY - p.height / 2) / camera.zoom
        clampCamera()
        setPopupData(null)
        requestDraw()
      }

      const zoomBy = (factor) => zoomAt(camera.zoom * factor)

      const resourceIconSize = () =>
        clamp(34 + (camera.zoom / fitZoom - 1) * 2, 34, 45)

      const findResourceAt = (screenX, screenY) => {
        const hitRadius = Math.max(resourceIconSize() / 2, 22)
        let closest = null
        let closestDistance = Number.POSITIVE_INFINITY

        resourceItems.forEach((item) => {
          const position = worldToScreen(item.position)
          const distance = Math.hypot(position.x - screenX, position.y - screenY)
          if (distance <= hitRadius && distance < closestDistance) {
            closest = item
            closestDistance = distance
          }
        })

        return closest
      }

      const selectResourceAt = (screenX, screenY) => {
        const resource = findResourceAt(screenX, screenY)
        if (!resource) {
          setPopupData(null)
          return
        }

        setPopupData({
          ...resource,
          anchor: worldToScreen(resource.position),
        })
      }

      const beginPinch = () => {
        const points = [...activePointers.values()]
        if (points.length < 2) return

        const midpoint = {
          x: (points[0].x + points[1].x) / 2,
          y: (points[0].y + points[1].y) / 2,
        }
        pinch = {
          distance: Math.max(
            Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y),
            1,
          ),
          midpoint,
          anchor: screenToWorld(midpoint.x, midpoint.y),
          zoom: camera.zoom,
        }
        pinchingOccurred = true
      }

      const handlePointerDown = (event) => {
        const point = canvasCoordinates(event)
        activePointers.set(event.pointerId, point)
        canvas.elt.setPointerCapture?.(event.pointerId)
        canvas.elt.style.cursor = 'grabbing'
        setPopupData(null)

        if (activePointers.size === 1) {
          pinchingOccurred = false
          gesture = {
            startedAt: performance.now(),
            start: point,
            last: point,
            moved: false,
          }
        } else if (activePointers.size === 2) {
          beginPinch()
        }
      }

      const handlePointerMove = (event) => {
        const point = canvasCoordinates(event)

        if (!activePointers.has(event.pointerId)) {
          canvas.elt.style.cursor = findResourceAt(point.x, point.y)
            ? 'pointer'
            : 'grab'
          return
        }

        activePointers.set(event.pointerId, point)

        if (activePointers.size >= 2) {
          if (!pinch) beginPinch()
          const points = [...activePointers.values()]
          const midpoint = {
            x: (points[0].x + points[1].x) / 2,
            y: (points[0].y + points[1].y) / 2,
          }
          const distance = Math.max(
            Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y),
            1,
          )
          const nextZoom = clamp(
            pinch.zoom * (distance / pinch.distance),
            fitZoom,
            getMaximumZoom(),
          )

          camera.zoom = nextZoom
          camera.x = pinch.anchor.x - (midpoint.x - p.width / 2) / nextZoom
          camera.y = pinch.anchor.y - (midpoint.y - p.height / 2) / nextZoom
          clampCamera()
          requestDraw()
          return
        }

        if (!gesture) return

        const deltaX = point.x - gesture.last.x
        const deltaY = point.y - gesture.last.y
        gesture.moved =
          gesture.moved ||
          Math.hypot(point.x - gesture.start.x, point.y - gesture.start.y) > 5
        gesture.last = point
        camera.x -= deltaX / camera.zoom
        camera.y -= deltaY / camera.zoom
        clampCamera()
        requestDraw()
      }

      const handlePointerUp = (event) => {
        const point = canvasCoordinates(event)
        const wasTap =
          event.type === 'pointerup' &&
          activePointers.size === 1 &&
          gesture &&
          !gesture.moved &&
          !pinchingOccurred &&
          performance.now() - gesture.startedAt < 500

        activePointers.delete(event.pointerId)
        canvas.elt.releasePointerCapture?.(event.pointerId)

        if (wasTap) selectResourceAt(point.x, point.y)

        if (activePointers.size === 1) {
          const remaining = [...activePointers.values()][0]
          gesture = {
            startedAt: performance.now(),
            start: remaining,
            last: remaining,
            moved: true,
          }
        } else if (activePointers.size === 0) {
          gesture = null
          pinchingOccurred = false
          canvas.elt.style.cursor = 'grab'
        }
        pinch = null
      }

      const handleWheel = (event) => {
        event.preventDefault()
        const point = canvasCoordinates(event)
        const factor = Math.exp(-event.deltaY * 0.0012)
        zoomAt(camera.zoom * factor, point.x, point.y)
      }

      const handleKeyDown = (event) => {
        const key = event.key.toLowerCase()
        let handled = true
        let shouldClosePopup = true

        if (event.key === 'ArrowLeft') camera.x -= KEYBOARD_PAN_DISTANCE / camera.zoom
        else if (event.key === 'ArrowRight') camera.x += KEYBOARD_PAN_DISTANCE / camera.zoom
        else if (event.key === 'ArrowUp') camera.y -= KEYBOARD_PAN_DISTANCE / camera.zoom
        else if (event.key === 'ArrowDown') camera.y += KEYBOARD_PAN_DISTANCE / camera.zoom
        else if (key === '+' || key === '=') zoomBy(ZOOM_STEP)
        else if (key === '-' || key === '_') zoomBy(1 / ZOOM_STEP)
        else if (key === 'home' || key === '0') resetView()
        else if (key === 'enter' || key === ' ') {
          selectResourceAt(p.width / 2, p.height / 2)
          shouldClosePopup = false
        }
        else handled = false

        if (handled) {
          event.preventDefault()
          clampCamera()
          if (shouldClosePopup) setPopupData(null)
          requestDraw()
        }
      }

      const attachCanvasEvents = () => {
        const element = canvas.elt
        element.style.touchAction = 'none'
        element.style.cursor = 'grab'
        element.tabIndex = 0
        element.setAttribute('role', 'application')
        element.setAttribute(
          'aria-label',
          'Carte procédurale interactive. Faites glisser pour vous déplacer, utilisez la molette ou les touches plus et moins pour zoomer, et les flèches pour naviguer.',
        )
        element.addEventListener('pointerdown', handlePointerDown)
        element.addEventListener('pointermove', handlePointerMove)
        element.addEventListener('pointerup', handlePointerUp)
        element.addEventListener('pointercancel', handlePointerUp)
        element.addEventListener('wheel', handleWheel, { passive: false })
        element.addEventListener('keydown', handleKeyDown)
      }

      const resizeCanvasToHost = () => {
        if (!mountRef.current) return
        const { width, height } = mountRef.current.getBoundingClientRect()
        const nextWidth = Math.max(1, Math.round(width))
        const nextHeight = Math.max(1, Math.round(height))
        if (nextWidth === resizeWidth && nextHeight === resizeHeight) return

        const previousFitZoom = fitZoom
        const zoomRatio = previousFitZoom ? camera.zoom / previousFitZoom : 1
        resizeWidth = nextWidth
        resizeHeight = nextHeight
        p.resizeCanvas(nextWidth, nextHeight, true)
        fitZoom = getFitZoom()
        camera.zoom = clamp(fitZoom * zoomRatio, fitZoom, getMaximumZoom())
        clampCamera()
        setPopupData(null)
        requestDraw()
      }

      p.preload = () => {
        loadedIcons = Object.fromEntries(
          resources.map((resource) => [resource.id, p.loadImage(resource.icon)]),
        )
      }

      p.setup = () => {
        const bounds = mountRef.current.getBoundingClientRect()
        resizeWidth = Math.max(1, Math.round(bounds.width))
        resizeHeight = Math.max(1, Math.round(bounds.height))
        p.pixelDensity(1)
        canvas = p.createCanvas(resizeWidth, resizeHeight)
        p.noLoop()
        p.imageMode(p.CORNER)
        p.textFont('system-ui')

        const generatedTerrain = createTerrainTexture(p, seed)
        terrainTexture = generatedTerrain.terrain
        resourceItems = createResourceItems(generatedTerrain.biomeMap, seed)
        resourceItems = resourceItems.map((item) => ({
          ...item,
          image: loadedIcons[item.type],
        }))

        resetView()
        attachCanvasEvents()

        canvasApiRef.current = {
          zoomBy,
          resetView,
          focus: () => canvas.elt.focus(),
        }

        resizeObserver = new ResizeObserver(() => {
          window.cancelAnimationFrame(resizeFrame)
          resizeFrame = window.requestAnimationFrame(resizeCanvasToHost)
        })
        resizeObserver.observe(mountRef.current)

        window.requestAnimationFrame(() => {
          if (!disposed) onReady(resourceItems.length)
        })
      }

      p.draw = () => {
        if (!terrainTexture) return

        p.background(8, 19, 19)
        p.drawingContext.imageSmoothingEnabled = true

        const mapLeft = (0 - camera.x) * camera.zoom + p.width / 2
        const mapTop = (0 - camera.y) * camera.zoom + p.height / 2
        const mapWidth = WORLD_WIDTH * camera.zoom
        const mapHeight = WORLD_HEIGHT * camera.zoom
        p.image(terrainTexture, mapLeft, mapTop, mapWidth, mapHeight)

        p.noFill()
        p.stroke(214, 203, 161, 80)
        p.strokeWeight(1)
        p.rect(mapLeft + 0.5, mapTop + 0.5, mapWidth - 1, mapHeight - 1)

        const iconSize = resourceIconSize()
        resourceItems.forEach((item) => {
          const position = worldToScreen(item.position)
          if (
            position.x < -iconSize ||
            position.x > p.width + iconSize ||
            position.y < -iconSize ||
            position.y > p.height + iconSize
          ) {
            return
          }

          p.noStroke()
          p.fill(5, 17, 15, 115)
          p.circle(position.x + 1, position.y + 3, iconSize + 10)
          p.fill(225, 218, 180, 42)
          p.circle(position.x, position.y, iconSize + 6)
          p.image(
            item.image,
            position.x - iconSize / 2,
            position.y - iconSize / 2,
            iconSize,
            iconSize,
          )
        })
      }
    }

    instance = new p5(sketch, mountRef.current)

    return () => {
      disposed = true
      window.cancelAnimationFrame(resizeFrame)
      resizeObserver?.disconnect()
      canvasApiRef.current = null
      instance.remove()
    }
  }, [onReady, seed])

  return (
    <div ref={rootRef} className="terrain-canvas">
      <div ref={mountRef} className="terrain-canvas__mount" />
      <ResourcePopup
        data={popupData}
        containerRef={rootRef}
        onClose={closePopup}
      />
    </div>
  )
})

export default TerrainCanvas
