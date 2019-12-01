import { Drawable } from "./drawable.mjs";
import { DrawableLineStrip, LineStripElement } from "./drawableLineStrip.mjs";
import { Vector2 } from "../../core/vector2.mjs";

export class DrawableCurve extends Drawable {
    constructor(curve) {
        super();

        this.curve = curve;

        this._startThickness = 1;
        this._endThickness = 1;

        this.step = 0.05;
        
        this.generateStrip();
    }

    get startThickness() {
        return this._startThickness;
    }

    set startThickness(value) {
        this._startThickness = value;
        this.generateStrip();
    }

    get endThickness() {
        return this._endThickness;
    }

    set endThickness(value) {
        this._endThickness = value;
        this.generateStrip();
    }

    /**
     * Fills this curve on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    fill(layer, brush) {
        this.strip.fill(layer, brush);

        this.curve.color = brush.invertedColor;
        layer.wireframes.push(this.curve);
    }

    /**
     * Outlines this curve on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    stroke(layer, brush) {
        this.strip.stroke(layer, brush);

        this.curve.color = brush.invertedColor;
        layer.wireframes.push(this.curve);
    }

    /**
     * Generates line strip based on curve and specified thickness
     */
    generateStrip() {
        this.strip = new DrawableLineStrip();
        let length = this.curve.getLength(0.05), currentlen = 0, thicknessChange = this._endThickness - this._startThickness;

        let prev = this.curve.getPoint(0);
        this.strip.addPoint(new LineStripElement(prev, this._startThickness));

        for (let i = this.step; i < 1; i += this.step) {
            let point = this.curve.getPoint(i);

            currentlen += prev.distanceFrom(point);

            this.strip.addPoint(new LineStripElement(point, this._startThickness + thicknessChange * (currentlen / length)));

            prev = point;
        }

        this.strip.addPoint(new LineStripElement(this.curve.getPoint(1), this._endThickness));
        this.strip.generate();
    }
}