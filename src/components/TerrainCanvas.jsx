// src/components/TerrainCanvas.jsx
import { useEffect } from "react";
import p5 from "p5";
import woodIconPath from "../assets/wood_icon.png";
import stoneIconPath from "../assets/stone_icon.png";
import waterIconPath from "../assets/water_icon.png";

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
    useEffect(() => {
        const sketch = (p) => {
            let waterTerrain,
                sandTerrain,
                grassTerrain,
                mountainTerrain,
                snowMountainTerrain;
            let woodIcon, stoneIcon, waterIcon;
            let items = [];
            let zoomFactor = 100;
            let mapChanged = true;
            let xOffset = 10000;
            let yOffset = 10000;

            // Définir une marge pour éviter les bords
            const margin = 50;

            p.preload = () => {
                woodIcon = p.loadImage(woodIconPath);
                stoneIcon = p.loadImage(stoneIconPath);
                waterIcon = p.loadImage(waterIconPath);
            };

            p.setup = () => {
                p.createCanvas(p.windowWidth, p.windowHeight);
                p.noLoop();
                p.noSmooth();
                p.noiseDetail(8, 0.5);

                // Initialisation des terrains
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
                    0.7,
                    p.color(118, 239, 124),
                    p.color(75, 175, 75)
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
                    p.color(255, 255, 255),
                    p.color(240, 240, 240)
                );

                // Générer les icônes sur la carte
                generateItems();
            };

            const generateItems = () => {
                let woodCount = 3;
                let stoneCount = 3;
                let waterCount = 3;

                // Génération de la carte et des icônes
                while (woodCount > 0 || stoneCount > 0 || waterCount > 0) {
                    // Générer des coordonnées en respectant la marge
                    const x = p.random(margin, p.width - margin);
                    const y = p.random(margin, p.height - margin);
                    const noiseValue = p.noise(
                        (x - p.width / 2) / zoomFactor + xOffset,
                        (y - p.height / 2) / zoomFactor + yOffset
                    );

                    // Placer de l'eau
                    if (waterCount > 0 && noiseValue < waterTerrain.maxHeight) {
                        items.push({ icon: waterIcon, position: { x, y } });
                        console.log(
                            `Water icon placed at: (${x.toFixed(2)}, ${y.toFixed(2)})`
                        );
                        waterCount--;
                    }
                    // Placer de la pierre
                    else if (
                        stoneCount > 0 &&
                        noiseValue >= mountainTerrain.minHeight &&
                        noiseValue < mountainTerrain.maxHeight
                    ) {
                        items.push({ icon: stoneIcon, position: { x, y } });
                        console.log(
                            `Stone icon placed at: (${x.toFixed(2)}, ${y.toFixed(2)})`
                        );
                        stoneCount--;
                    }
                    // Placer du bois
                    else if (
                        woodCount > 0 &&
                        noiseValue >= grassTerrain.minHeight &&
                        noiseValue < mountainTerrain.minHeight
                    ) {
                        items.push({ icon: woodIcon, position: { x, y } });
                        console.log(
                            `Wood icon placed at: (${x.toFixed(2)}, ${y.toFixed(2)})`
                        );
                        woodCount--;
                    }
                }
            };

            p.draw = () => {
                if (!mapChanged) return;

                for (let x = 0; x < p.width; x++) {
                    for (let y = 0; y < p.height; y++) {
                        const xVal = (x - p.width / 2) / zoomFactor + xOffset;
                        const yVal = (y - p.height / 2) / zoomFactor + yOffset;
                        const noiseValue = p.noise(xVal, yVal);

                        let terrainColor;
                        if (noiseValue < waterTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, waterTerrain);
                        } else if (noiseValue < sandTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, sandTerrain);
                        } else if (noiseValue < grassTerrain.maxHeight) {
                            terrainColor = getTerrainColor(noiseValue, grassTerrain);
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

                // Affichage des icônes à leurs positions respectives
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

    return null; // Ce composant ne rend rien d'autre que le canvas
};

export default TerrainCanvas;
