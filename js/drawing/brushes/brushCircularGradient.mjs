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

        this.steps = [new GradientStep(0, innerColor), new GradientStep(1, outerColor)];
        
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.center = center;

        this.generate();
    }

    /**
     * Generates layer used for drawing with this brush
     */
    generate() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let progress = new Vector2(x, y).distanceFrom(this.center) / this.radius;
                
                if (progress > 1) {
                    progress = 1;
                }

                for (let i = 0; i < this.steps.length - 1; i++) {
                    if (this.steps[i].progress <= progress && this.steps[i + 1].progress >= progress) {
                        let scaledProgress = (progress - this.steps[i].progress) / (this.steps[i + 1].progress - this.steps[i].progress);

                        this.layer.setPixel(x, y, this.steps[i].color.transition(this.steps[i + 1].color, scaledProgress));
                    }
                }
            }
        }
        
        this.invertedColor = new Color(0, 0, 0, 1);

        for (let i = 0; i < this.steps.length; i++) {
            this.invertedColor.r += this.steps[i].color.r;
            this.invertedColor.g += this.steps[i].color.g;
            this.invertedColor.b += this.steps[i].color.b;
        }

        this.invertedColor.r = Math.floor(255 - (this.invertedColor.r / this.steps.length));
        this.invertedColor.g = Math.floor(255 - (this.invertedColor.g / this.steps.length));
        this.invertedColor.b = Math.floor(255 - (this.invertedColor.b / this.steps.length));
    }

    /**
     * Adds step to the gradient at specified range
     * @param {Number} progress - Normalized distance from the center (0-1)
     * @param {Color} color - Color of the step
     */
    addStep(progress, color) {
        this.steps.push(new GradientStep(progress, color));
        this.steps.sort((a, b) => { return a.progress - b.progress; });

        this.generate();
    }
}

class GradientStep {
    constructor(progress, color) {
        this.progress = progress;
        this.color = color;
    }
}