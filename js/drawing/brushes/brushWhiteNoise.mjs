import { Color } from "../../core/color.mjs";
import { Brush } from "./brush.mjs";

export class BrushWhiteNoise extends Brush {
    /**
     * Brush filled with white noise in specified color
     * @param {Number} width - Width of generated layer
     * @param {Number} height - Height of generated layer
     * @param {Color} color - Color of noise
     */
    constructor(width, height, color) {
        super(width, height);

        if (color == undefined) {
            color = new Color(255, 255, 255, 1);
        }
        
        this.color = color;

        this.invertedColor = new Color(255 - color.r, 255 - color.g, 255 - color.b, 1);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let brightness = Math.random();

                this.layer.setPixel(x, y, new Color(Math.floor(this.color.r * brightness), Math.floor(this.color.g * brightness), Math.floor(this.color.b * brightness), this.color.a));
            }
        }
    }

    toString() {
        return "[WhiteNoise] color: " + this.color.toString();
    }
}