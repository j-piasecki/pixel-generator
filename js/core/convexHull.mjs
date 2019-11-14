import { Vector2 } from "./vector2.mjs";

export class ConvexHull {

    /**
     * @param {Vector2} a 
     * @param {Vector2} b 
     * @param {Vector2} c 
     */
    static ccw(a, b, c) {
        let v = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

        if (Math.abs(v) < 0.0001) {
            return 0;
        }

        if (v > 0) {
            return -1;
        }

        return 1;
    }

    /**
     * Graham scan algorithm
     * @param {Array.<Vector2>} points 
     * @returns {Array.<Vector2>} - Returns convex hull of provided points
     */
    static grahamScan(points) {
        let hull = [];

        if (points.length < 3) {
            return hull;
        }

        let start = 0;
        for (let i = 1; i < points.length; i++) {
            if (points[i].y < points[start].y || (points[i].y == points[start].y && points[i].x < points[start].x)) {
                start = i;
            }
        }

        let temp = points[0];
        points[0] = points[start];
        points[start] = temp;

        let pivot = points.shift();

        points.sort((a, b) => {
            let order = this.ccw(pivot, a, b);

            if (order == 0) {
                return (pivot.distanceFrom(a) < pivot.distanceFrom(b)) ? -1 : 1;
            }

            return order;
        });

        hull.push(pivot);
        hull.push(points[0]);
        hull.push(points[1]);

        for (let i = 2; i < points.length; i++) {
            let top = hull.pop();

            while (this.ccw(hull[hull.length - 1], top, points[i]) != -1) {
                top = hull.pop();
            }

            hull.push(top);
            hull.push(points[i]);
        }

        return hull;
    }
}