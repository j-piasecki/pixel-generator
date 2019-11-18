import { Vector2 } from "./vector2.mjs";

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
    get symmetryVector() {
        return (Vector2.subtract(this.end, this.start)).rightPerpendicular().normalize();
    }

    /**
     * @param {Vector2} point 
     * @returns {number} - Returns distance between this line and specified point
     */
    distanceFrom(point) {
        return Math.abs((this.end.x - this.start.x) * (this.start.y - point.y) - (this.start.x - point.x) * (this.end.y - this.start.y)) / Math.sqrt((this.end.x - this.start.x) * (this.end.x - this.start.x) + (this.end.y - this.start.y) * (this.end.y - this.start.y));
    }

    /**
     * @param {Vector2} point
     * @returns {Vector2} - Returns symmetrical point with respect to this line
     */
    symmetricalPoint(point) {
        let step = this.symmetryVector;

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
}