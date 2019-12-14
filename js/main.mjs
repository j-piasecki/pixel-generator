import { Vector2 } from "./core/vector2.mjs";
import { Line } from "./core/line.mjs";
import { ConvexHull } from "./core/convexHull.mjs";
import { Polygon } from "./core/polygon.mjs";
import { CanvasManager } from "./drawing/canvasManager.mjs";
import { Color } from "./core/color.mjs";
import { Curve } from "./core/curve.mjs";
import { LineStrip, LineStripElement } from "./core/lineStrip.mjs";
import { BrushWhiteNoise } from "./drawing/brushes/brushWhiteNoise.mjs";
import { BrushSolidColor } from "./drawing/brushes/brushSolidColor.mjs";
import { DrawableLine } from "./drawing/drawables/drawableLine.mjs";
import { DrawableEdgyOval } from "./drawing/drawables/drawableEdgyOval.mjs";
import { DrawablePolygon } from "./drawing/drawables/drawablePolygon.mjs";
import { DrawableCurve } from "./drawing/drawables/drawableCurve.mjs";
import { DrawableLineStrip } from "./drawing/drawables/drawableLineStrip.mjs";
import { ScriptInterpreter } from "./scripting/scriptInterpreter.mjs";
import { BrushCircularGradient } from "./drawing/brushes/brushCircularGradient.mjs";
import { BrushLinearGradient } from "./drawing/brushes/brushLinearGradient.mjs";
import { Layer } from "./drawing/layer.mjs";

var canvas = document.getElementById("canvas");
var canvasManager = new CanvasManager(canvas);
canvasManager.init(64, 64);

var codeInput = document.getElementById("code-area");
codeInput.onkeydown = e => {
    if (e.keyCode == 9 || e.which == 9) {
        e.preventDefault();
        let s = codeInput.selectionStart;
        codeInput.value = codeInput.value.substring(0, s) + "\t" + codeInput.value.substring(s);
        codeInput.selectionEnd = s + 1; 
    }
}

var scriptInterpreter = new ScriptInterpreter(canvasManager);

window.onload = () => {
    document.getElementById("action-center").addEventListener("click", (e) => { canvasManager.centerContent(true); });
    document.getElementById("action-run").addEventListener("click", (e) => { scriptInterpreter.run(codeInput.value); });
    document.getElementById("action-switch-wireframes").addEventListener("click", (e) => { canvasManager.wireframesVisible = !canvasManager.wireframesVisible; });
}