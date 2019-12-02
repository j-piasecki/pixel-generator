import { Vector2 } from "../../core/vector2.mjs";
import { Line } from "../../core/line.mjs";
import { Drawable } from "./drawable.mjs";
import { DrawableLine } from "./drawableLine.mjs";

export class DrawablePolygon extends Drawable {
    /**
     * @param {Polygon} polygon 
     */
    constructor(polygon) {
        super();

        this.polygon = polygon;

        this.wireframeVisible = true;

        this.generateOutline(1);
    }

    /**
     * Fills this polygon on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    fill(layer, brush) {
        for (let x = 0; x < layer.width; x++) {
            for (let y = 0; y < layer.height; y++) {
                let point = new Vector2(x + 0.5, y + 0.5);
                
                if (this.polygon.containsPoint(point)) {
                    layer.setPixel(x, y, brush.layer.getPixel(x, y).copy());
                }
            }
        }

        if (this.wireframeVisible) {
            this.polygon.color = brush.invertedColor;
            layer.wireframes.push(this.polygon);
        }
    }

    /**
     * Outlines this polygon on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    stroke(layer, brush) {
        for (let i = 0; i < this.outline.length; i++) {
            this.outline[i].fill(layer, brush);
        }

        if (this.wireframeVisible) {
            this.polygon.color = brush.invertedColor;
            layer.wireframes.push(this.polygon);
        }
    }

    /**
     * Sets outline thickness to specified width
     * @param {Number} width - New thickness
     */
    setStrokeWidth(width) {
        this.generateOutline(width);
    }

    /**
     * Generates drawableLines used for rendering outline
     * @param {Number} width - Thickness of outline
     */
    generateOutline(width) {
        this.outline = [];

        let center = this.polygon.getCenter();

        for (let i = 0, j = this.polygon.vertices.length - 1; i < this.polygon.vertices.length; j = i++) {
            let start = Vector2.subtract(this.polygon.vertices[j], new Vector2(0.5, 0.5));
            let end = Vector2.subtract(this.polygon.vertices[i], new Vector2(0.5, 0.5));
    
            let a = Vector2.add(start, Vector2.multiplyByNumber(Vector2.subtract(center, start).normalize(), 0.4));
            let b = Vector2.add(end, Vector2.multiplyByNumber(Vector2.subtract(center, end).normalize(), 0.4));
    
            this.outline[i] = new DrawableLine(new Line(a, b));
            this.outline[i].startThickness = this.outline[i].endThickness = width;
            this.outline[i].wireframeVisible = false;
        }
    }
}