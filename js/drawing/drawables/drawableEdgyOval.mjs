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
     * @param {?Number} startingAngle - Angle of the first point in radians
     * @param {?Number} offset - Offset by which a point can be moved (0-1)
     */
    constructor(center, minRadius, maxRadius, points, startingAngle, offset) {
        super();

        this.polygon = new Polygon();
        this.center = center;
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
        this.offset = (offset == undefined || offset == null) ? 0 : offset;
        this.startingAngle = (startingAngle == undefined || startingAngle == null) ? 0 : startingAngle;

        let angle = Math.PI * 2 / points, sum = 0;
        
        for (let i = 0; i < points; i++) {
            let r = minRadius + (maxRadius - minRadius) * Math.random();
            let currentAngle = angle * (1 + (1 - Math.random() * 2) * this.offset);

            this.polygon.setPoint(i, new Vector2(center.x + r * Math.cos(this.startingAngle + sum + currentAngle), center.y + r * Math.sin(this.startingAngle + sum + currentAngle)));

            sum += currentAngle;
        }

        this.drawablePolygon = new DrawablePolygon(this.polygon);
    }

    /**
     * Fills this oval on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    fill(layer, brush) {
        this.drawablePolygon.fill(layer, brush);

        this.color = brush.invertedColor;
        layer.wireframes.push(this);
    }

    /**
     * Outlines this oval on specified layer using selected brush
     * @param {Layer} layer - Layer to be drawn on
     * @param {Brush} brush - Brush to be used when drawing
     */
    stroke(layer, brush) {
        this.drawablePolygon.stroke(layer, brush);

        this.color = brush.invertedColor;
        layer.wireframes.push(this);
    }

    /**
     * Sets outline thickness to specified width
     * @param {Number} width - New thickness
     */
    setStrokeWidth(width) {
        this.drawablePolygon.setStrokeWidth(width);
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

    toString() {
        return "[EdgyOval] center: (" + this.center.x + ", " + this.center.y + "), minRadius: " + this.minRadius + ", maxRadius: " + this.maxRadius + ", points: " + this.points;
    }
}