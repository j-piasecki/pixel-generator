import { Vector2 } from "./vector2.mjs";
import { CanvasManager } from "../drawing/canvasManager.mjs";
import { Color } from "./color.mjs";

export class Line {
    /**
     * @param {Vector2} start - First point of line
     * @param {Vector2} end - Last point of line
     */
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    /**
     * @returns {Vector2} - Returns normalized perpendicular vector
     */
    get normalVector() {
        return (Vector2.subtract(this.end, this.start)).normal().normalize();
    }

    /**
     * @returns {Number} - Returns length of the line
     */
    get length() {
        return this.start.distanceFrom(this.end);
    }

    /**
     * @param {Vector2} point 
     * @returns {number} - Returns distance between this line and specified point
     */
    distanceFrom(point) {
        return Line.distance(this.start, this.end, point);
    }

    /**
     * @param {Vector2} point
     * @returns {Vector2} - Returns symmetrical point with respect to this line
     */
    symmetricalPoint(point) {
        let step = this.normalVector;

        if (this.distanceFrom(point) <= this.distanceFrom(Vector2.add(point, step)))
            step.reverse();

        return Vector2.add(point, Vector2.multiply(step, new Vector2(this.distanceFrom(point) * 2, this.distanceFrom(point) * 2)));
    }

    /**
     * @param {Line} axis - Axis of symmetry
     * @returns {Line} - Returns symmetrical line with respect to specified axis
     */
    symmetrical(axis) {
        return new Line(axis.symmetricalPoint(this.start), axis.symmetricalPoint(this.end));
    }

    /**
     * Draws the line with specified canvas manager
     * @param {CanvasManager} canvas 
     */
    draw(canvas) {
        canvas.context.strokeStyle = this.color.getRGBAString();

        let startX = Math.floor(canvas.translation.x * canvas.scale);
        let startY = Math.floor(canvas.translation.y * canvas.scale);
        let size = canvas.pixelSize * canvas.scale

        canvas.context.beginPath();
        canvas.context.moveTo(startX + this.start.x * size, startY + this.start.y * size);
        canvas.context.lineTo(startX + this.end.x * size, startY + this.end.y * size);
        canvas.context.stroke();

        this.start.color = this.end.color = this.color;
        this.start.draw(canvas);
        this.end.draw(canvas);
    }

    /**
     * @param {Vector2} start - First point of line
     * @param {Vector2} end - Second point of line
     * @param {Vector2} point - Point to be used in calculation
     * @returns {number} - Returns distance between line and specified point
     */
    static distance(start, end, point) {
        return Math.abs((end.x - start.x) * (start.y - point.y) - (start.x - point.x) * (end.y - start.y)) / Math.sqrt((end.x - start.x) * (end.x - start.x) + (end.y - start.y) * (end.y - start.y));
    }

    /**
     * @param {Vector2} start - First point of line
     * @param {Vector2} end - Second point of line
     * @param {Vector2} point - Point to be used in calculation
     * @returns {number} - Returns signed distance between line and specified point
     */
    static signedDistance(start, end, point) {
        return ((end.x - start.x) * (start.y - point.y) - (start.x - point.x) * (end.y - start.y)) / Math.sqrt((end.x - start.x) * (end.x - start.x) + (end.y - start.y) * (end.y - start.y));
    }

    /**
     * @param {Vector2} point - Starting point of the line
     * @param {Number} length - Length of the line
     * @param {Number} angle - Angle of the line
     * @returns {Line} - Retruns created line 
     */
    static create(point, length, angle) {
        let line = new Line(point, new Vector2(point.x, point.y + length));

        line.end.rotate(angle, point);

        return line;
    }
}