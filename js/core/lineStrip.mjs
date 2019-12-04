import { Vector2 } from "./vector2.mjs";

export class LineStrip {
    /**
     * @param {?Array.<LineStripElement>} points - List of points in the strip
     */
    constructor(points) {
        this.points = (points == undefined) ? [] : points;
        this.generatedPoints = [];
    }

    /**
     * Adds point to strip
     * @param {LineStripElement} point 
     */
    addPoint(point) {
        this.points.push(point);
    }

    /**
     * Generates line strip based on specified points
     * @returns {Array.<Vector2>} - Returns array of generated points in drawing order
     */
    generate() {
        let calculated = [];

        for (let i = 0; i < this.points.length - 1; i++) {
            if (i == 0) { //for the first point just calculate normal and add points
                let normal = Vector2.subtract(this.points[i + 1].point, this.points[i].point).normal().normalize();

                calculated.push(new Vector2(this.points[i].point.x + normal.x * this.points[i].thickness / 2, this.points[i].point.y + normal.y * this.points[i].thickness / 2));
                calculated.push(new Vector2(this.points[i].point.x - normal.x * this.points[i].thickness / 2, this.points[i].point.y - normal.y * this.points[i].thickness / 2));
            } else { //for points inbetween calculate tangent, then normal to tangent and get points perpendicular to the tangent
                let tangent = Vector2.add(Vector2.subtract(this.points[i].point, this.points[i - 1].point), Vector2.subtract(this.points[i + 1].point, this.points[i].point)).normalize();
                let normal = tangent.normal();

                calculated.push(new Vector2(this.points[i].point.x + normal.x * this.points[i].thickness / 2, this.points[i].point.y + normal.y * this.points[i].thickness / 2));
                calculated.push(new Vector2(this.points[i].point.x - normal.x * this.points[i].thickness / 2, this.points[i].point.y - normal.y * this.points[i].thickness / 2));
            
            }
        }

        //for the last point the same as for the first
        let index = this.points.length - 1;
        let normal = Vector2.subtract(this.points[index].point, this.points[index - 1].point).normal().normalize();

        calculated.push(new Vector2(this.points[index].point.x + normal.x * this.points[index].thickness / 2, this.points[index].point.y + normal.y * this.points[index].thickness / 2));
        calculated.push(new Vector2(this.points[index].point.x - normal.x * this.points[index].thickness / 2, this.points[index].point.y - normal.y * this.points[index].thickness / 2));
    
        //points are forming triangulated polygon, sorting them so the top and the bottom ones are next to each other
        this.generatedPoints = [];

        for (let i = 0; i < calculated.length; i += 2) {
            this.generatedPoints.push(calculated[i]);
        }

        for (let i = calculated.length - 1; i > 0; i -= 2) {
            this.generatedPoints.push(calculated[i]);
        }

        return this.generatedPoints;
    }
}

export class LineStripElement {
    /**
     * Element of line strip
     * @param {Vector2} point - Point on the strip
     * @param {?Number} thickness - Thickness at specified point (1 if unspecified)
     */
    constructor(point, thickness) {
        this.point = point;
        this.thickness = (thickness == undefined) ? 1 : thickness;
    }
}