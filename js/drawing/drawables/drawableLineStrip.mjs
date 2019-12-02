import { Vector2 } from "../../core/vector2.mjs";
import { Polygon } from "../../core/polygon.mjs";
import { Drawable } from "./drawable.mjs";
import { DrawablePolygon } from "./drawablePolygon.mjs";

export class DrawableLineStrip extends Drawable {
    /**
     * @param {Array.<LineStripElement>} points - List of points in the strip (not required)
     */
    constructor(points) {
        super();
        
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

        //generate objects for drawing
        let polygon = new Polygon();
        polygon.allowSorting = false;
        for (let i = 0; i < this.generatedPoints.length; i++) {
            polygon.setPoint(i, this.generatedPoints[i]);
        }

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
}

export class LineStripElement {
    /**
     * Element of line strip
     * @param {Vector2} point - Point on the strip
     * @param {Number} thickness - Thickness at specified point (1 if unspecified)
     */
    constructor(point, thickness) {
        this.point = point;
        this.thickness = (thickness == undefined) ? 1 : thickness;
    }
}