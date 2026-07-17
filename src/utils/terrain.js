import resources from './resources'

export const WORLD_WIDTH = 1440
export const WORLD_HEIGHT = 960
export const TERRAIN_WIDTH = 720
export const TERRAIN_HEIGHT = 480

export const BIOMES = [
  {
    id: 'deep-water',
    label: 'Eaux profondes',
    min: 0,
    max: 0.24,
    colorStart: [18, 55, 72],
    colorEnd: [25, 82, 99],
    swatch: '#17485b',
  },
  {
    id: 'water',
    label: 'Eaux côtières',
    min: 0.24,
    max: 0.4,
    colorStart: [33, 93, 108],
    colorEnd: [55, 127, 133],
    swatch: '#347985',
  },
  {
    id: 'sand',
    label: 'Rivages',
    min: 0.4,
    max: 0.47,
    colorStart: [183, 164, 119],
    colorEnd: [204, 188, 140],
    swatch: '#c3ad7d',
  },
  {
    id: 'grassland',
    label: 'Prairies',
    min: 0.47,
    max: 0.63,
    colorStart: [91, 133, 84],
    colorEnd: [69, 113, 73],
    swatch: '#5b8054',
  },
  {
    id: 'forest',
    label: 'Forêts',
    min: 0.63,
    max: 0.72,
    colorStart: [54, 103, 67],
    colorEnd: [38, 77, 57],
    swatch: '#326044',
  },
  {
    id: 'mountain',
    label: 'Montagnes',
    min: 0.72,
    max: 0.84,
    colorStart: [112, 115, 105],
    colorEnd: [149, 146, 130],
    swatch: '#7d7c71',
  },
  {
    id: 'snow',
    label: 'Sommets enneigés',
    min: 0.84,
    max: 1.01,
    colorStart: [188, 194, 182],
    colorEnd: [229, 230, 214],
    swatch: '#d8dacd',
  },
]

export const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum)

export function createSeed() {
  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]
  }

  return Math.floor(Math.random() * 0xffffffff)
}

export const formatSeed = (seed) =>
  seed.toString(16).toUpperCase().padStart(8, '0')

function interpolateChannel(start, end, amount, variation) {
  return clamp(Math.round(start + (end - start) * amount + variation), 0, 255)
}

function getBiomeIndex(elevation) {
  const biomeIndex = BIOMES.findIndex((biome) => elevation < biome.max)
  return biomeIndex === -1 ? BIOMES.length - 1 : biomeIndex
}

function smoothstep(edge0, edge1, value) {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return amount * amount * (3 - 2 * amount)
}

export function createTerrainTexture(p, seed) {
  p.noiseSeed(seed)
  p.noiseDetail(4, 0.5)

  const terrain = p.createImage(TERRAIN_WIDTH, TERRAIN_HEIGHT)
  const biomeMap = new Uint8Array(TERRAIN_WIDTH * TERRAIN_HEIGHT)
  const worldStepX = WORLD_WIDTH / TERRAIN_WIDTH
  const worldStepY = WORLD_HEIGHT / TERRAIN_HEIGHT
  const offsetX = 180 + (seed & 0xffff) * 0.0031
  const offsetY = 420 + (seed >>> 16) * 0.0031

  terrain.loadPixels()

  for (let y = 0; y < TERRAIN_HEIGHT; y += 1) {
    const worldY = y * worldStepY
    const normalizedY = Math.abs((y / (TERRAIN_HEIGHT - 1)) * 2 - 1)

    for (let x = 0; x < TERRAIN_WIDTH; x += 1) {
      const worldX = x * worldStepX
      const normalizedX = Math.abs((x / (TERRAIN_WIDTH - 1)) * 2 - 1)
      const continentalNoise = p.noise(
        offsetX + worldX * 0.0029,
        offsetY + worldY * 0.0029,
      )
      const detailNoise = p.noise(
        offsetX * 1.7 + worldX * 0.0105,
        offsetY * 1.7 + worldY * 0.0105,
      )
      const edgeDistance = Math.max(normalizedX, normalizedY)
      const oceanFalloff = smoothstep(0.72, 1, edgeDistance) * 0.34
      const combinedNoise = continentalNoise * 0.76 + detailNoise * 0.24
      const elevation = clamp((combinedNoise - 0.28) / 0.44 - oceanFalloff, 0, 1)
      const biomeIndex = getBiomeIndex(elevation)
      const biome = BIOMES[biomeIndex]
      const biomeProgress = clamp(
        (elevation - biome.min) / (biome.max - biome.min),
        0,
        1,
      )
      const grainHash = ((x * 374761393 + y * 668265263 + seed) >>> 0) % 997
      const variation = (grainHash / 997 - 0.5) * 5
      const pixelIndex = (x + y * TERRAIN_WIDTH) * 4

      terrain.pixels[pixelIndex] = interpolateChannel(
        biome.colorStart[0],
        biome.colorEnd[0],
        biomeProgress,
        variation,
      )
      terrain.pixels[pixelIndex + 1] = interpolateChannel(
        biome.colorStart[1],
        biome.colorEnd[1],
        biomeProgress,
        variation,
      )
      terrain.pixels[pixelIndex + 2] = interpolateChannel(
        biome.colorStart[2],
        biome.colorEnd[2],
        biomeProgress,
        variation,
      )
      terrain.pixels[pixelIndex + 3] = 255
      biomeMap[x + y * TERRAIN_WIDTH] = biomeIndex
    }
  }

  terrain.updatePixels()
  return { terrain, biomeMap }
}

function createRandom(seed) {
  let state = seed >>> 0

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(values, random) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[values[index], values[target]] = [values[target], values[index]]
  }
}

function isFarEnough(candidate, selected, minimumDistance) {
  return selected.every((item) => {
    const deltaX = item.position.x - candidate.x
    const deltaY = item.position.y - candidate.y
    return Math.hypot(deltaX, deltaY) >= minimumDistance
  })
}

export function createResourceItems(biomeMap, seed) {
  const random = createRandom(seed ^ 0xa52ce17)
  const candidates = Object.fromEntries(
    resources.map((resource) => [resource.id, []]),
  )
  const margin = 22
  const sampleStep = 5

  for (let y = margin; y < TERRAIN_HEIGHT - margin; y += sampleStep) {
    for (let x = margin; x < TERRAIN_WIDTH - margin; x += sampleStep) {
      const sampleX = clamp(Math.round(x + (random() - 0.5) * 5), margin, TERRAIN_WIDTH - margin)
      const sampleY = clamp(Math.round(y + (random() - 0.5) * 5), margin, TERRAIN_HEIGHT - margin)
      const biome = BIOMES[biomeMap[sampleX + sampleY * TERRAIN_WIDTH]]

      resources.forEach((resource) => {
        if (resource.biomes.includes(biome.id)) {
          candidates[resource.id].push({
            x: (sampleX / TERRAIN_WIDTH) * WORLD_WIDTH,
            y: (sampleY / TERRAIN_HEIGHT) * WORLD_HEIGHT,
          })
        }
      })
    }
  }

  return resources.flatMap((resource) => {
    const available = candidates[resource.id]
    const selected = []
    shuffle(available, random)

    const addResource = (candidate) => {
      const [minimumQuantity, maximumQuantity] = resource.quantity
      selected.push({
        id: `${resource.id}-${selected.length + 1}`,
        type: resource.id,
        label: resource.label,
        icon: resource.icon,
        position: candidate,
        quantity: Math.round(
          minimumQuantity + random() * (maximumQuantity - minimumQuantity),
        ),
      })
    }

    for (const candidate of available) {
      if (isFarEnough(candidate, selected, resource.minSpacing)) {
        addResource(candidate)
      }

      if (selected.length === resource.count) break
    }

    // Les biomes rares peuvent manquer d'espace pour la distance idéale. Dans ce
    // cas, on complète uniquement avec des candidats du même biome, sans doublon.
    if (selected.length < resource.count) {
      for (const candidate of available) {
        if (!selected.some((item) => item.position === candidate)) {
          addResource(candidate)
        }

        if (selected.length === resource.count) break
      }
    }

    return selected
  })
}
