// src/components/P5Wrapper.jsx
import TerrainCanvas from './TerrainCanvas';

const P5Wrapper = () => {
  const woodIconPosition = { x: window.innerWidth / 2 +165, y: window.innerHeight / 2 }; // Position de l'icône

  return (
    <div>
      <TerrainCanvas woodIconPosition={woodIconPosition} />
    </div>
  );
};

export default P5Wrapper;
