import { Vector2 } from "./vector2.mjs";

export class Curve {
    /**
     * @param {Vector2} start - Starting point of the curve
     * @param {Vector2} end - End point of the curve
     */
    constructor(start, end) {
        this.start = start;
        this.end = end;

        this.firstControl = new Vector2(start.x + (end.x - start.x) / 3, start.y + (end.y - start.y) / 3);
        this.secondControl = new Vector2(start.x + (end.x - start.x) * 2 / 3, start.y + (end.y - start.y) * 2 / 3);
    }

    /**
     * @param {Number} t - Index of curve point (0-1)
     * @returns {Vector2} - Returns point on the curve at specified index
     */
    getPoint(t) {
        let x = (1 - t) * (1 - t) * (1 - t) * this.start.x + 3 * (1 - t) * (1 - t) * t * this.firstControl.x + 3 * (1 - t) * t * t * this.secondControl.x + t * t * t * this.end.x;
        let y = (1 - t) * (1 - t) * (1 - t) * this.start.y + 3 * (1 - t) * (1 - t) * t * this.firstControl.y + 3 * (1 - t) * t * t * this.secondControl.y + t * t * t * this.end.y;

        return new Vector2(x, y);
    }

    /**
     * 
     * @param {Number} step - Step used for calculation (0-1)
     * @returns {Number} - Returns length of the curve approximated with specified step
     */
    getLength(step) {
        let prev = this.start, current, result = 0;

        for (let i = step; i < 1; i += step) {
            current = this.getPoint(step);
            result += prev.distanceFrom(current);

            prev = current;
        }

        return result + prev.distanceFrom(this.end);
    }

    /**
     * @param {Number} t - Index of curve point (0-1)
     * @param {Boolean} first - Specifies whether to return first part of the curve (0-t) or second (t-1)
     * @returns {Curve} - Returns specified part of the curve
     */
    getPart(t, first) {
        if (first || first == undefined) {
            return this._getPart(t, this.start, this.firstControl, this.secondControl, this.end);
        } else {
            return this._getPart(1 - t, this.end, this.secondControl, this.firstControl, this.start);
        }
    }

    /**
     * Draws the curve with specified canvas manager
     * @param {CanvasManager} canvas 
     */
    draw(canvas) {
        canvas.context.strokeStyle = this.color.getRGBAString();

        let startX = Math.floor(canvas.translation.x * canvas.scale);
        let startY = Math.floor(canvas.translation.y * canvas.scale);
        let size = canvas.pixelSize * canvas.scale

        canvas.context.beginPath();
        canvas.context.moveTo(startX + this.start.x * size, startY + this.start.y * size);

        for (let i = 0; i < 1; i += 0.03) {
            let point = this.getPoint(i);
            canvas.context.lineTo(startX + point.x * size, startY + point.y * size);
        }

        canvas.context.lineTo(startX + this.end.x * size, startY + this.end.y * size);
        canvas.context.stroke();

        canvas.context.beginPath();
        canvas.context.moveTo(startX + this.start.x * size, startY + this.start.y * size);
        canvas.context.lineTo(startX + this.firstControl.x * size, startY + this.firstControl.y * size);
        canvas.context.stroke();

        canvas.context.beginPath();
        canvas.context.moveTo(startX + this.end.x * size, startY + this.end.y * size);
        canvas.context.lineTo(startX + this.secondControl.x * size, startY + this.secondControl.y * size);
        canvas.context.stroke();

        this.start.color = this.end.color = this.firstControl.color = this.secondControl.color = this.color;
        this.start.draw(canvas);
        this.end.draw(canvas);
        this.secondControl.draw(canvas);
        this.firstControl.draw(canvas);
    }

    _getPart(t, v1, v2, v3, v4) {
        let v12 = new Vector2((v2.x - v1.x) * t + v1.x, (v2.y - v1.y) * t + v1.y);
        let v23 = new Vector2((v3.x - v2.x) * t + v2.x, (v3.y - v2.y) * t + v2.y);
        let v34 = new Vector2((v4.x - v3.x) * t + v3.x, (v4.y - v3.y) * t + v3.y);

        let v123 = new Vector2((v23.x - v12.x) * t + v12.x, (v23.y - v12.y) * t + v12.y);
        let v234 = new Vector2((v34.x - v23.x) * t + v23.x, (v34.y - v23.y) * t + v23.y);

        let v1234 = new Vector2((v234.x - v123.x) * t + v123.x, (v234.y - v123.y) * t + v123.y);

        let result = new Curve(v1, v1234);
        result.firstControl = v12;
        result.secondControl = v123;

        return result;
    }
}