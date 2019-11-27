import { Vector2 } from "./vector2.mjs";

export class Polygon {
    constructor() {
        this.vertices = new Array();
    }

    /**
     * Set point at index to specified coordinates
     * @param {Number} index - Index of the point
     * @param {Vector2} point - Coordinates of the point
     */
    setPoint(index, point) {
        this.vertices[index] = point;
    }

    /**
     * @param {Number} index - Index of the point
     * @returns {Vector2} - Returns point with specified index
     */
    getPoint(index) {
        return this.vertices[index];
    }

    /**
     * @returns {Number} - Returns center of the polygon
     */
    getCenter() {
        let x = 0, y = 0;

        for (let i = 0; i < this.vertices.length; i++) {
            x += this.vertices[i].x;
            y += this.vertices[i].y;
        }

        return new Vector2(x / this.vertices.length, y / this.vertices.length);
    }

    /**
     * Sorts vertices of the polygon clockwise
     */
    sortVertices() {
        if (this.vertices.length == 0)
            return;


        let center = this.getCenter();

        this.vertices.sort((v1, v2) => {
            return Math.atan2(v2.x - center.x, v2.y - center.y) - Math.atan2(v1.x - center.x, v1.y - center.y);
        });
    }

    /**
     * @param {Vector2} point - Point to check
     * @returns {Boolean} - Returns true if point is contained within polygon, otherwise it returns false 
     */
    containsPoint(point) {
        let inside = false;

        for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
            if ((this.vertices[i].y > point.y) != (this.vertices[j].y > point.y) && point.x < (this.vertices[j].x - this.vertices[i].x) * (point.y - this.vertices[i].y) / (this.vertices[j].y - this.vertices[i].y) + this.vertices[i].x) {
                inside = !inside;
            }
        }

        return inside;
    }

    /**
     * Rotates polygon by specified angle (around specified origin)
     * @param {number} angle - Angle of rotation in radians
     * @param {Vector2} point - Origin of rotation (unnecesary)
     */
    rotate(angle, point) {
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].rotate(angle, point);
        }
    }

    /**
     * Draws the polygon with specified canvas manager
     * @param {CanvasManager} canvas 
     */
    draw(canvas) {
        this.sortVertices();
        canvas.context.strokeStyle = "rgb(0, 0, 255)";

        let startX = Math.floor(canvas.translation.x * canvas.scale);
        let startY = Math.floor(canvas.translation.y * canvas.scale);
        let size = canvas.pixelSize * canvas.scale

        canvas.context.beginPath();
        canvas.context.moveTo(startX + this.vertices[0].x * size, startY + this.vertices[0].y * size);

        for (let i = 1; i < this.vertices.length; i++)
            canvas.context.lineTo(startX + this.vertices[i].x * size, startY + this.vertices[i].y * size);
            
        canvas.context.closePath();
        canvas.context.stroke();
    }
}