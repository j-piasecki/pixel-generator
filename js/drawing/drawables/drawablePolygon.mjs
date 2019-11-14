import { Vector2 } from "../../core/vector2.mjs";
import { Drawable } from "./drawable.mjs";

export class DrawablePolygon extends Drawable {
    /**
     * @param {Polygon} polygon 
     */
    constructor(polygon) {
        super();

        this.polygon = polygon;
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
    }

    /**
     * Outlines this polygon on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    stroke(layer, brush) {
        for (let i = 0, j = this.polygon.vertices.length - 1; i < this.polygon.vertices.length; j = i++) {
            let v1 = this.polygon.getPoint(j);
            let v2 = this.polygon.getPoint(i);
            let current = v1.copy(), step = Vector2.subtract(v2, v1).normalize();

            do {
                if (Math.floor(current.x) >= 0 && Math.floor(current.x) < layer.width && Math.floor(current.y) >= 0 && Math.floor(current.y) < layer.height) {
                    layer.setPixel(Math.floor(current.x), Math.floor(current.y), brush.layer.getPixel(Math.floor(current.x), Math.floor(current.y)).copy());
                }

                current = Vector2.add(current, step);
            } while(current.distanceFrom(v2) > 0 && current.distanceFrom(v2) > current.distanceFrom(Vector2.add(current, step)));
        }
    }
}