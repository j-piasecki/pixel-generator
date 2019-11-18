import { Vector2 } from "./core/vector2.mjs";
import { Line } from "./core/line.mjs";
import { ConvexHull } from "./core/convexHull.mjs";
import { Polygon } from "./core/polygon.mjs";
import { CanvasManager } from "./drawing/canvasManager.mjs";
import { Color } from "./core/color.mjs";
import { BrushWhiteNoise } from "./drawing/brushes/brushWhiteNoise.mjs";
import { DrawableLine } from "./drawing/drawables/drawableLine.mjs";
import { DrawablePolygon } from "./drawing/drawables/drawablePolygon.mjs";

var canvas = document.getElementById("canvas");
var canvasManager = new CanvasManager(canvas);
canvasManager.init(32, 32);

window.onload = () => {
    

    document.getElementById("action-center").addEventListener("click", (e) => { canvasManager.centerContent(true); });


    
    let brush = new BrushWhiteNoise(32, 32, new Color(255, 0, 0, 1));
    let line = new DrawableLine(new Line(new Vector2(5, 5), new Vector2(20, 0)));

    line.fill(canvasManager.nextLayer, brush);


    let poly = new Polygon();
    poly.setPoint(0, new Vector2(8, 8));
    poly.setPoint(1, new Vector2(32, 8));
    poly.setPoint(2, new Vector2(32, 32));
    poly.setPoint(3, new Vector2(8, 32));

    let dpoly = new DrawablePolygon(poly);

    dpoly.fill(canvasManager.nextLayer, brush);
}