import { Vector2 } from "./core/vector2.mjs";
import { Line } from "./core/line.mjs";
import { ConvexHull } from "./core/convexHull.mjs";
import { Polygon } from "./core/polygon.mjs";
import { CanvasManager } from "./drawing/canvasManager.mjs";
import { Color } from "./core/color.mjs";
import { BrushWhiteNoise } from "./drawing/brushes/brushWhiteNoise.mjs";
import { DrawableLine } from "./drawing/drawables/drawableLine.mjs";
import { DrawablePolygon } from "./drawing/drawables/drawablePolygon.mjs";
import { ScriptInterpreter } from "./scripting/scriptInterpreter.mjs";
import { BrushCircularGradient } from "./drawing/brushes/brushCircularGradient.mjs";

var canvas = document.getElementById("canvas");
var canvasManager = new CanvasManager(canvas);
canvasManager.init(32, 32);

var codeInput = document.getElementById("code-area");
var scriptInterpreter = new ScriptInterpreter();

window.onload = () => {
    document.getElementById("action-center").addEventListener("click", (e) => { canvasManager.centerContent(true); });
    document.getElementById("action-run").addEventListener("click", (e) => { scriptInterpreter.run(codeInput.value); });
    document.getElementById("action-switch-wireframes").addEventListener("click", (e) => { canvasManager.wireframesVisible = !canvasManager.wireframesVisible; });
}