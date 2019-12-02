import { Vector2 } from "../../core/vector2.mjs";
import { Line } from "../../core/line.mjs";
import { Brush } from "./brush.mjs";
import { Color } from "../../core/color.mjs";

export class BrushLinearGradient extends Brush {
    /**
     * Brush filled with linear gradient
     * @param {Number} width - Width of generated layer
     * @param {Number} height - Height of generated layer
     * @param {Line} line - Line of gradient
     * @param {Color} start - Starting color of gradient
     * @param {Color} end - Second color of gradient
     */
    constructor(width, height, line, start, end) {
        super(width, height);

        this.line = line;
        this.normal = Vector2.add(line.start, line.normalVector);
        this.startColor = start;
        this.endColor = end;

        this.invertedColor = new Color(255 - (start.r + end.r) / 2, 255 - (start.g + end.g) / 2, 255 - (start.b + end.b) / 2, 1);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let progress = Line.signedDistance(this.line.start, this.normal, new Vector2(x + 0.5, y + 0.5)) / this.line.length;

                if (progress > 1) progress = 1;
                if (progress < 0) progress = 0;
                
                this.layer.setPixel(x, y, this.startColor.transition(this.endColor, progress));
            }
        }
    }
}