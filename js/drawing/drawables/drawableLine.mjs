import { Drawable } from "./drawable.mjs";
import { Line } from "../../core/line.mjs";
import { Vector2 } from "../../core/vector2.mjs";
import { Polygon } from "../../core/polygon.mjs";
import { Layer } from "../layer.mjs";

export class DrawableLine extends Drawable {
    /**
     * @param {Line} line 
     */
    constructor(line) {
        super();

        this.line = line;
        this.line.start.x += 0.5;
        this.line.start.y += 0.5;
        this.line.end.x += 0.5;
        this.line.end.y += 0.5;

        this.polygon = new Polygon();
        this._startThickness = 1;
        this._endThickness = 1;

        this.generatePolygon();
    }

    set startThickness(val) {
        this._startThickness = val;

        this.generatePolygon();
    }

    get startThickness() { return this._startThickness; }

    set endThickness(val) {
        this._endThickness = val;

        this.generatePolygon();
    }

    get endThickness() { return this._endThickness; }

    /**
     * Draws the line on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    fill(layer, brush) {
        for (let x = 0; x < layer.width; x++) {
            for (let y = 0; y < layer.height; y++) {
                let point = new Vector2(x + 0.5, y + 0.5);
                let distance = this.line.distanceFrom(point);

                if (distance <= 0.5 && Math.abs(this.line.start.distanceFrom(this.line.end) - this.line.start.distanceFrom(point) - this.line.end.distanceFrom(point)) < 0.5) {
                    let color = brush.layer.getPixel(x, y).copy();
                    color.a *= (1 - distance);
                    layer.setPixel(x, y, color);
                }
            }
        }

        layer.wireframes.push(this.line);
    }

    /**
     * Generates polygon matching line with specified thickness
     */
    generatePolygon() {
        let perp = Vector2.subtract(this.line.end, this.line.start).leftPerpendicular().normalize();
        
        this.polygon.setPoint(0, new Vector2(this.line.start.x - perp.x * this._startThickness * 0.5, this.line.start.y - perp.y * this._startThickness * 0.5));
        this.polygon.setPoint(1, new Vector2(this.line.start.x + perp.x * this._startThickness * 0.5, this.line.start.y + perp.y * this._startThickness * 0.5));
        this.polygon.setPoint(2, new Vector2(this.line.end.x + perp.x * this._endThickness * 0.5, this.line.end.y + perp.y * this._endThickness * 0.5));
        this.polygon.setPoint(3, new Vector2(this.line.end.x - perp.x * this._endThickness * 0.5, this.line.end.y - perp.y * this._endThickness * 0.5));
    }
}