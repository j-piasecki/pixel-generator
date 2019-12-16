import { Vector2 } from "../../core/vector2.mjs";
import { Polygon } from "../../core/polygon.mjs";
import { LineStrip } from "../../core/lineStrip.mjs";
import { Drawable } from "./drawable.mjs";
import { DrawablePolygon } from "./drawablePolygon.mjs";

export class DrawableLineStrip extends Drawable {
    /**
     * @param {LineStrip} strip - Line strip used to generate polygon
     */
    constructor(strip) {
        super();
        
        this.strip = strip;
        this.generate();
    }

    generate() {
        //generate objects for drawing
        let polygon = new Polygon();
        polygon.allowSorting = false;
        polygon.addPointRange(this.strip.generate());

        this.drawablePolygon = new DrawablePolygon(polygon);
    }

    /**
     * Fills this strip on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    fill(layer, brush) {
        this.drawablePolygon.fill(layer, brush);
    }

    /**
     * Outlines this strip on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    stroke(layer, brush) {
        this.drawablePolygon.stroke(layer, brush);
    }

    /**
     * Sets outline thickness to specified width
     * @param {Number} width - New thickness
     */
    setStrokeWidth(width) {
        this.drawablePolygon.setStrokeWidth(width);
    }

    toString() {
        return this.strip.toString();
    }
}