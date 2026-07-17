import resources from '../utils/resources'
import { BIOMES } from '../utils/terrain'

function Legend() {
  return (
    <aside className="map-legend glass-panel" aria-labelledby="legend-title">
      <div className="map-legend__header">
        <span className="map-legend__compass" aria-hidden="true">✦</span>
        <h2 id="legend-title">Légende</h2>
      </div>
      <div className="map-legend__content">
        <section aria-labelledby="biome-legend-title">
          <h3 id="biome-legend-title">Biomes</h3>
          <ul className="biome-list">
            {BIOMES.map((biome) => (
              <li key={biome.id}>
                <span
                  className="biome-swatch"
                  style={{ backgroundColor: biome.swatch }}
                  aria-hidden="true"
                />
                <span>{biome.label}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="resource-legend-title">
          <h3 id="resource-legend-title">Ressources</h3>
          <ul className="resource-list">
            {resources.map((resource) => (
              <li key={resource.id}>
                <img src={resource.icon} alt="" aria-hidden="true" />
                <span>{resource.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  )
}

export default Legend
