import { Vector2 } from "../core/vector2.mjs";
import { Color } from "../core/color.mjs";

export class Layer {
    /**
     * Creates two dimensional layer of pixels with specified size
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(width, height) {
        this.setSize(width, height);
    }

    /**
     * Sets size of layer anf fills it with transparent pixels
     * @param {Number} width 
     * @param {Number} height 
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.pixels = [];
        for (let x = 0; x < width; x++) {
            this.pixels[x] = [];
            for (let y = 0; y < height; y++) {
                this.pixels[x][y] = new Color(0, 0, 0, 0);
            }
        }
    }

    /**
     * Sets every pixel to transparent
     */
    clear() {
        for (let x = 0; x < this.width; x++) {
            this.pixels[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.pixels[x][y] = new Color(0, 0, 0, 0);
            }
        }
    }

    /**
     * @param {Number} x - First coordinate of pixel
     * @param {Number} y - Second coordinate of pixel
     * @returns {Color} - Returns color of pixel at specified position, or null if out of bonds
     */
    getPixel(x, y) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            return this.pixels[x][y];
        }

        return null;
    }

    /**
     * Sets color of pixel at specified position
     * @param {Number} x - First coordinate of pixel
     * @param {Number} y - Second coordinate of pixel
     * @param {Color} color - Color to be applied
     */
    setPixel(x, y, color) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            this.pixels[x][y] = color;
        }
    }
}