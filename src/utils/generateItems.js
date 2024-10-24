// src/utils/generateItems.js

import resources from './resources';

const generateItems = (p, items, terrainTypes, margin, zoomFactor, xOffset, yOffset) => {
    let woodCount = 7;
    let stoneCount = 5;
    let waterCount = 2;

    while (woodCount > 0 || stoneCount > 0 || waterCount > 0) {
        const x = p.random(margin, p.width - margin);
        const y = p.random(margin, p.height - margin);
        const noiseValue = p.noise(
            (x - p.width / 2) / zoomFactor + xOffset,
            (y - p.height / 2) / zoomFactor + yOffset
        );

        // Placer de l'eau
        if (waterCount > 0 && noiseValue < terrainTypes.water.maxHeight && noiseValue >= terrainTypes.water.minHeight) {
            items.push({ ...resources.water, position: { x, y } });
            waterCount--;
        }
        // Placer de la pierre
        else if (
            stoneCount > 0 &&
            noiseValue >= terrainTypes.mountain.minHeight &&
            noiseValue < terrainTypes.mountain.maxHeight
        ) {
            items.push({ ...resources.stone, position: { x, y } });
            stoneCount--;
        }
        // Placer du bois
        else if (
            woodCount > 0 &&
            noiseValue >= terrainTypes.grass.maxHeight &&
            noiseValue < terrainTypes.forest.maxHeight
        ) {
            items.push({ ...resources.wood, position: { x, y } });
            woodCount--;
        }
    }
    console.log(items);
};

export default generateItems;
