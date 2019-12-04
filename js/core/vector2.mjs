export class Vector2 {
    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.rangeX = 0; //Max x offset for generating random point in the area
        this.rangeY = 0; //Max y offset for generating random point in the area
        this.parent = null; //Parent/source vector
        this.color = null;
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Normalizes this vector
     * @returns {Vector2} - Returns normalized vector
     */
    normalize() {
        let len = this.length;

        this.x /= len;
        this.y /= len;

        return this;
    }

    /**
     * Creates a copy of this vector and normalizes it
     * @returns {Vector2} - Returns normalized vector
     */
    createNormalized() {
        let len = this.length;

        if (len == 0) {
            return new Vector2(0, 0);
        }

        return new Vector2(this.x / len, this.y / len);
    }

    /**
     * Rotates vector by specified angle (around specified origin)
     * @param {number} angle - Angle of rotation in radians
     * @param {?Vector2} point - Origin of rotation
     * @returns {Vector2} - Returns this vector
     */
    rotate(angle, point) {
        let originX = 0, originY = 0;

        if (point != undefined || point != null) {
            originX = point.x;
            originY = point.y;
        }

        let s = Math.sin(angle);
        let c = Math.cos(angle);

        this.x -= originX;
        this.y -= originY;

        let nx = this.x * c - this.y * s, ny = this.x * s + this.y * c;

        this.x = nx + originX;
        this.y = ny + originY;

        return this;
    }

    /**
     * @param {Vector2} other
     * @returns {number} - Distance from specified vector 
     */
    distanceFrom(other) {
        return Math.sqrt((this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y));
    }

    /**
     * @returns {Vector2} - Returns normal vector
     */
    normal() {
        return new Vector2(-this.y, this.x);
    }

    /**
     * Sets radius for generating random points in the area
     * @param {Number} radius - New radius
     * @returns {Vector2} - Returns this vector
     */
    setRadius(radius) {
        this.rangeX = this.rangeY = radius;

        return this;
    }

    /**
     * Sets range for generating random points in the area
     * @param {Number} x - New x range
     * @param {Number} y - New y range
     * @returns {Vector2} - Returns this vector
     */
    setRange(x, y) {
        this.rangeX = x;
        this.rangeY = y;

        return this;
    }

    /**
     * Sets new parent to this vector
     * @param {Vector2} parent - New parent
     * @returns {Vector2} - Returns this vector
     */
    setParent(parent) {
        this.parent = parent;

        return this;
    }

    /**
     * @returns {Vector2} - Returns random point in area created by this one
     */
    next() {
        let result = null;

        do {
            result = new Vector2(this.x + (Math.random() * 2 - 1) * this.rangeX, this.y + (Math.random() * 2 - 1) * this.rangeY);
        } while (result.distanceFrom(this) > this.rangeX && Math.abs(this.rangeX - this.rangeY) < 0.01); //if both offsets are equal they are treated as radius so new point is generated until it lands inside circle, otherwise the first one is returned

        return result.setParent(this);
    }

    /**
     * Reverses vector (multiples both coordinates by -1)
     */
    reverse() {
        this.x *= -1;
        this.y *= -1;
    }

    /**
     * @returns {Vector2} - Returns a copy of this vector 
     */
     copy() {
        return new Vector2(this.x, this.y);
    }

    /**
     * Draws the vector with specified canvas manager
     * @param {CanvasManager} canvas 
     */
    draw(canvas) {
        if (this.parent != null) {
            this.parent.color = this.color;
            this.parent.draw(canvas);
            //return;
        }

        canvas.context.strokeStyle = this.color.getRGBAString();
        canvas.context.fillStyle = this.color.getRGBAString();

        let startX = Math.floor(canvas.translation.x * canvas.scale);
        let startY = Math.floor(canvas.translation.y * canvas.scale);
        let size = canvas.pixelSize * canvas.scale

        if (this.rangeY == this.rangeX) {
            canvas.context.beginPath();
            canvas.context.arc(startX + this.x * size, startY + this.y * size, this.rangeX * size, 0, Math.PI * 2);
            canvas.context.closePath();
            canvas.context.stroke();
        } else {
            canvas.context.beginPath();
            canvas.context.moveTo(startX + this.x * size - this.rangeX * size, startY + this.y * size - this.rangeY * size);
            canvas.context.lineTo(startX + this.x * size + this.rangeX * size, startY + this.y * size - this.rangeY * size);
            canvas.context.lineTo(startX + this.x * size + this.rangeX * size, startY + this.y * size + this.rangeY * size);
            canvas.context.lineTo(startX + this.x * size - this.rangeX * size, startY + this.y * size + this.rangeY * size);
            canvas.context.closePath();
            canvas.context.stroke();
        }

        canvas.context.beginPath();
        canvas.context.arc(startX + this.x * size, startY + this.y * size, 3, 0, Math.PI * 2);
        canvas.context.fill();
    }

    /**
     * @param {Vector2} vec1 
     * @param {Vector2} vec2
     * @returns {number} - Returns an angle between two specified vectors 
     */
    static angle(vec1, vec2) {
        let v1 = vec1.createNormalized(), v2 = vec2.createNormalized();

        let deltaY = (v1.Y - v2.Y);
        let deltaX = (v2.X - v1.X);
        let result = Math.atan2(deltaY, deltaX);

        if (result < 0.0001)
            return 0;
        else
            return result;
    }

    /**
     * @param {Vector2} v1 
     * @param {Vector2} v2 
     * @returns {number} - Returns dot product of two specified vectors
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * @param {Vector2} v1 
     * @param {Vector2} v2 
     * @returns {Vector2} - Adds two specified vectors
     */
    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    /**
     * @param {Vector2} v1 
     * @param {Vector2} v2 
     * @returns {Vector2} - Subtracts two specified vectors
     */
    static subtract(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * @param {Vector2} v1 
     * @param {Vector2} v2 
     * @returns {Vector2} - Multiples coordinates of two specified vectors
     */
    static multiply(v1, v2) {
        return new Vector2(v1.x * v2.x, v1.y * v2.y);
    }

    /**
     * @param {Vector2} v
     * @param {Number} n
     * @returns {Vector2} - Multiples specified vector by the number
     */
    static multiplyByNumber(v, n) {
        return new Vector2(v.x * n, v.y * n);
    }

    /**
     * @param {Vector2} v1 
     * @param {Vector2} v2 
     * @returns {Vector2} - Divides coordinates of two specified vectors
     */
    static divide(v1, v2) {
        return new Vector2(v1.x / v2.x, v1.y / v2.y);
    }
}