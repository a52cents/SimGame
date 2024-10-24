// src/components/TerrainCanvas.jsx
import { useEffect, useState } from "react";
import p5 from "p5";
import resources from "../utils/resources"; // Importer les ressources
import Popup from "./Popup"; // Importer le composant Popup

class TerrainType {
    constructor(minHeight, maxHeight, minColor, maxColor, lerpAdjustment = 0) {
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
        this.minColor = minColor;
        this.maxColor = maxColor;
        this.lerpAdjustment = lerpAdjustment;
    }
}

const TerrainCanvas = () => {
    const [popupData, setPopupData] = useState(null);
    
    useEffect(() => {
        const sketch = (p) => {
            let deepwaterTerrain,
                waterTerrain,
                sandTerrain,
                grassTerrain,
                forestTerrain,
                mountainTerrain,
                snowMountainTerrain;
            let items = [];
            let zoomFactor = 125;
            let mapChanged = true;
            let xOffset = 10000;
            let yOffset = 10000;

            const margin = 50;

            p.preload = () => {
                // Chargement des icônes depuis les ressources
                Object.keys(resources).forEach((key) => {
                    resources[key].icon = p.loadImage(resources[key].icon);
                });
            };

            p.setup = () => {
                p.createCanvas(p.windowWidth, p.windowHeight);
                p.noLoop();
                p.noSmooth();
                p.noiseDetail(8, 0.5);

                // Initialisation des terrains
                deepwaterTerrain = new TerrainType(
                    0,
                    0.2,
                    p.color(0, 0, 139),
                    p.color(30, 176, 251)
                );

                waterTerrain = new TerrainType(
                    0.2,
                    0.4,
                    p.color(30, 176, 251),
                    p.color(40, 255, 255)
                );
                sandTerrain = new TerrainType(
                    0.4,
                    0.5,
                    p.color(215, 192, 158),
                    p.color(255, 246, 193),
                    0.3
                );
                grassTerrain = new TerrainType(
                    0.5,
                    0.65,
                    p.color(118, 239, 124),
                    p.color(75, 175, 75)
                );
                forestTerrain = new TerrainType(
                    0.65,
                    0.7,
                    grassTerrain.maxColor,
                    p.color(34, 139, 34)
                );
                mountainTerrain = new TerrainType(
                    0.7,
                    0.8,
                    p.color(169, 169, 169),
                    p.color(128, 128, 128)
                );
                snowMountainTerrain = new TerrainType(
                    0.8,
                    1.0,
                    mountainTerrain.maxColor,
                    p.color(255, 255, 255)
                );

                // Générer les icônes sur la carte
                generateItems();
            };

            const generateItems = () => {
                // Récupérer les compteurs à partir des ressources
                const itemCounts = {
                    woodCount: resources.wood.count,
                    stoneCount: resources.stone.count,
                    waterCount: resources.water.count,
                };
                const quantity = resources.wood.quantity; // Assumons que tous ont la même quantité pour simplifier

                while (itemCounts.woodCount > 0 || itemCounts.stoneCount > 0 || itemCounts.waterCount > 0) {
                    const x = p.random(margin, p.width - margin);
                    const y = p.random(margin, p.height - margin);
                    const noiseValue = p.noise(
                        (x - p.width / 2) / zoomFactor + xOffset,
                        (y - p.height / 2) / zoomFactor + yOffset
                    );

                    // Placer de l'eau
                    if (itemCounts.waterCount > 0 && noiseValue < waterTerrain.maxHeight && noiseValue >= waterTerrain.minHeight) {
                        items.push({ icon: resources.water.icon, position: { x, y }, type: 'water', quantity });
                        itemCounts.waterCount--;
                    }
                    // Placer de la pierre
                    else if (
                        itemCounts.stoneCount > 0 &&
                        noiseValue >= mountainTerrain.minHeight &&
                        noiseValue < mountainTerrain.maxHeight
                    ) {
                        items.push({ icon: resources.stone.icon, position: { x, y }, type: 'stone', quantity });
                        itemCounts.stoneCount--;
                    }
                    // Placer du bois
                    else if (
                        itemCounts.woodCount > 0 &&
                        noiseValue >= grassTerrain.minHeight &&
                        noiseValue < forestTerrain.minHeight
                    ) {
                        items.push({ icon: resources.wood.icon, position: { x, y }, type: 'wood', quantity });
                        itemCounts.woodCount--;
                    }
                }
                console.log(items);
            };

            p.draw = () => {
                if (!mapChanged) return;

                for (let x = 0; x < p.width; x++) {
                    for (let y = 0; y < p.height; y++) {
                        const xVal = (x - p.width / 2) / zoomFactor + xOffset;
                        const yVal = (y - p.height / 2) / zoomFactor + yOffset;
                        const noiseValue = p.noise(xVal, yVal);

                        let terrainColor;
                        if (noiseValue < deepwaterTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, deepwaterTerrain);
                        } else if (noiseValue < waterTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, waterTerrain);
                        } else if (noiseValue < sandTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, sandTerrain);
                        } else if (noiseValue < grassTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, grassTerrain);
                        } else if (noiseValue < forestTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, forestTerrain);
                        } else if (noiseValue < mountainTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, mountainTerrain);
                        } else {
                            terrainColor = getTerrainColor(noiseValue, snowMountainTerrain);
                        }
                        p.set(x, y, terrainColor);
                    }
                }
                p.updatePixels();
                mapChanged = false;

                items.forEach((item) => {
                    const iconWidth = 32; // Largeur de l'icône
                    const iconHeight = 32; // Hauteur de l'icône
                    p.image(
                        item.icon,
                        item.position.x - iconWidth / 2,
                        item.position.y - iconHeight / 2,
                        iconWidth,
                        iconHeight
                    );
                });
            };

            const getTerrainColor = (noiseValue, mapType) => {
                const normalized = normalize(
                    noiseValue,
                    mapType.maxHeight,
                    mapType.minHeight
                );
                return p.lerpColor(
                    mapType.minColor,
                    mapType.maxColor,
                    normalized + mapType.lerpAdjustment
                );
            };

            const normalize = (value, max, min) => {
                if (value > max) return 1;
                if (value < min) return 0;
                return (value - min) / (max - min);
            };

            // Gestion des clics
            p.mousePressed = () => {
                const x = p.mouseX;
                const y = p.mouseY;

                const clickedItem = items.find((item) => {
                    const iconWidth = 32; // Largeur de l'icône
                    const iconHeight = 32; // Hauteur de l'icône
                    return (
                        x >= item.position.x - iconWidth / 2 &&
                        x <= item.position.x + iconWidth / 2 &&
                        y >= item.position.y - iconHeight / 2 &&
                        y <= item.position.y + iconHeight / 2
                    );
                });

                if (clickedItem) {
                    setPopupData({ type: clickedItem.type, position: clickedItem.position, quantity: clickedItem.quantity });
                }
            };

            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
                p.redraw();
            };
        };

        const myP5 = new p5(sketch);

        return () => {
            myP5.remove();
        };
    }, []);

    // Fonction pour fermer la popup
    const closePopup = () => {
        setPopupData(null);
    };

    return (
        <>
            <Popup data={popupData} onClose={closePopup} />
        </>
    );
};

export default TerrainCanvas;
