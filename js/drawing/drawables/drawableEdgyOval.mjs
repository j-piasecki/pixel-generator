import { Vector2 } from "../../core/vector2.mjs";
import { Drawable } from "./drawable.mjs";
import { DrawablePolygon } from "./drawablePolygon.mjs";
import { Polygon } from "../../core/polygon.mjs";

export class DrawableEdgyOval extends Drawable {
    /**
     * @param {Vector2} center - Center of both circles
     * @param {Number} minRadius - Radius of inner circle
     * @param {Number} maxRadius - Radius of outer circle
     * @param {Number} points - Number of points
     */
    constructor(center, minRadius, maxRadius, points) {
        super();

        this.polygon = new Polygon();
        this.center = center;
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;

        //TODO: random angle option
        let angle = Math.PI * 2 / points;
        
        for (let i = 0; i < points; i++) {
            let r = minRadius + (maxRadius - minRadius) * Math.random();

            this.polygon.setPoint(i, new Vector2(center.x + r * Math.cos(angle * i), center.y + r * Math.sin(angle * i)));
        }

        this.drawaBlePolygon = new DrawablePolygon(this.polygon);
    }

    /**
     * Fills this oval on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    fill(layer, brush) {
        this.drawaBlePolygon.fill(layer, brush);

        this.color = brush.invertedColor;
        layer.wireframes.push(this);
    }

    /**
     * Outlines this oval on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    stroke(layer, brush) {
        this.drawaBlePolygon.stroke(layer, brush);

        this.color = brush.invertedColor;
        layer.wireframes.push(this);
    }

    /**
     * Draws the wireframe with specified canvas manager
     * @param {CanvasManager} canvas 
     */
    draw(canvas) {
        canvas.context.strokeStyle = this.color.getRGBAString();

        let startX = Math.floor(canvas.translation.x * canvas.scale);
        let startY = Math.floor(canvas.translation.y * canvas.scale);
        let size = canvas.pixelSize * canvas.scale

        canvas.context.beginPath();
        canvas.context.arc(startX + this.center.x * size, startY + this.center.y * size, this.minRadius * size, 0, Math.PI * 2);
        canvas.context.closePath();
        canvas.context.stroke();

        canvas.context.beginPath();
        canvas.context.arc(startX + this.center.x * size, startY + this.center.y * size, this.maxRadius * size, 0, Math.PI * 2);
        canvas.context.closePath();
        canvas.context.stroke();
    }
}