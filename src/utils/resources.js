// src/utils/resources.js
import stoneIcon from '../assets/stone_icon.png'
import waterIcon from '../assets/water_icon.png'
import woodIcon from '../assets/wood_icon.png'

const resources = [
  {
    id: 'wood',
    label: 'Bois',
    icon: woodIcon,
    count: 11,
    quantity: [45, 120],
    biomes: ['grassland', 'forest'],
    minSpacing: 82,
    color: '#83b26d',
  },
  {
    id: 'stone',
    label: 'Pierre',
    icon: stoneIcon,
    count: 8,
    quantity: [35, 95],
    biomes: ['mountain', 'snow'],
    minSpacing: 100,
    color: '#b8c1bc',
  },
  {
    id: 'water',
    label: 'Eau',
    icon: waterIcon,
    count: 5,
    quantity: [60, 150],
    biomes: ['water'],
    minSpacing: 120,
    color: '#63b7c7',
  },
]

export const RESOURCE_LABELS = Object.fromEntries(
  resources.map((resource) => [resource.id, resource.label]),
)

export default resources
