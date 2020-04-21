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
        this.width = width;
        this.height = height;

        if (end == undefined) {
            this.steps = [new GradientStep(0, start)];
        } else {
            this.steps = [new GradientStep(0, start), new GradientStep(1, end)];
        }

        if (end != undefined)
            this.generate();
    }


    /**
     * Generates layer used for drawing with this brush
     */
    generate() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let progress = Line.signedDistance(this.line.start, this.normal, new Vector2(x + 0.5, y + 0.5)) / this.line.length;

                if (progress > 1) progress = 1;
                if (progress < 0) progress = 0;

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
     * @param {Number} progress - Normalized distance from the start point (0-1)
     * @param {Color} color - Color of the step
     * @param {Boolean} generate - Tells whether to regenerate brush layer
     */
    addStep(progress, color, generate) {
        this.steps.push(new GradientStep(progress, color));
        this.steps.sort((a, b) => { return a.progress - b.progress; });

        if (generate == undefined || generate)
            this.generate();
    }

    /**
     * @returns {Number} - Returns how much progress is left (0-1)
     */
    getRemainingProgress() {
        return 1 - this.steps[this.steps.length - 1].progress;
    }

    toString() {
        return "[LinearGradient] line: " + this.line.toString();
    }
}

class GradientStep {
    constructor(progress, color) {
        this.progress = progress;
        this.color = color;
    }
}