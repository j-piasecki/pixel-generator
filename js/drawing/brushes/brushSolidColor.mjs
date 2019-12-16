import { Brush } from "./brush.mjs";
import { Color } from "../../core/color.mjs";

export class BrushSolidColor extends Brush {
    /**
     * Brush filled with solid color
     * @param {Number} width - Width of generated layer
     * @param {Number} height - Height of generated layer
     * @param {Color} color - Color of generated layer
     */
    constructor(width, height, color) {
        super(width, height);

        if (color == undefined) {
            color = new Color(255, 255, 255, 1);
        }

        this.color = color;

        this.invertedColor = new Color(255 - color.r, 255 - color.g, 255 - color.b, 1);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.layer.setPixel(x, y, this.color.copy());
            }
        }
    }

    toString() {
        return "[SolidColor] color: " + this.color.toString();
    }
}