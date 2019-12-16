import { Drawable } from "./drawable.mjs";
import { DrawablePolygon } from "./drawablePolygon.mjs";
import { DrawableCurve } from "./drawableCurve.mjs";
import { DrawableLine } from "./drawableLine.mjs";
import { DrawableLineStrip } from "./drawableLineStrip.mjs";
import { Polygon } from "../../core/polygon.mjs";
import { Line } from "../../core/line.mjs";
import { LineStrip } from "../../core/lineStrip.mjs";
import { Curve } from "../../core/curve.mjs";

export class DrawableCreator {
    /**
     * Creates drawable object based on type of provided value
     * @param {Object} obj - Base for the drawable
     * @returns {Drawable} - Returns appropriate drawable
     */
    static create(obj) {
        if (obj instanceof Drawable) return obj;

        if (obj instanceof Polygon) return new DrawablePolygon(obj);
        if (obj instanceof Line) return new DrawableLine(obj);
        if (obj instanceof LineStrip) return new DrawableLineStrip(obj);
        if (obj instanceof Curve) return new DrawableCurve(obj);

        return null;
    }
}