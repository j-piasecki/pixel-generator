export class Vector2 {
    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
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
     * @param {Vector2} point - Origin of rotation (unnecesary)
     */
    rotate(angle, point) {
        let originX = 0, originY = 0;

        if (point != undefined) {
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
     * @returns {Vector2}
     */
    rightPerpendicular() {
        return new Vector2(-this.y, this.x);
    }

    /**
     * @returns {Vector2}
     */
    leftPerpendicular() {
        return new Vector2(this.y, -this.x);
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