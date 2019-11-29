import { Brush } from "./brush.mjs";
import { Color } from "../../core/color.mjs";
import { Vector2 } from "../../core/vector2.mjs";

export class BrushCircularGradient extends Brush {
    /**
     * Brush filled with circular gradient
     * @param {Number} width - Width of generated layer
     * @param {Number} height - Height of generated layer
     * @param {Vector2} center - Center of gradient
     * @param {Number} radius - Radius of gradient
     * @param {Color} innerColor - Start color of gradient
     * @param {Color} outerColor - End color of gradient
     */
    constructor(width, height, center, radius, innerColor, outerColor) {
        super(width, height);

        if (outerColor == undefined) {
            outerColor = new Color(0, 0, 0, 0);
        }

        this.innerColor = innerColor;
        this.outerColor = outerColor;
        
        this.invertedColor = new Color(255 - (innerColor.r + outerColor.r) / 2, 255 - (innerColor.g + outerColor.g) / 2, 255 - (innerColor.b + outerColor.b) / 2, 1);

        this.radius = radius;
        this.center = center;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let progress = new Vector2(x, y).distanceFrom(this.center) / this.radius;

                if (progress > 1) {
                    progress = 1;
                }
                
                this.layer.setPixel(x, y, this.innerColor.transition(this.outerColor, progress));
            }
        }
    }
}