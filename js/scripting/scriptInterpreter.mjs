import { CanvasManager } from "../drawing/canvasManager.mjs";
import { BrushSolidColor } from "../drawing/brushes/brushSolidColor.mjs";
import { BrushWhiteNoise } from "../drawing/brushes/brushWhiteNoise.mjs";
import { BrushCircularGradient } from "../drawing/brushes/brushCircularGradient.mjs";
import { BrushLinearGradient } from "../drawing/brushes/brushLinearGradient.mjs";
import { DrawableCreator } from "../drawing/drawables/drawableCreator.mjs";
import { DrawableOval } from "../drawing/drawables/drawableOval.mjs";
import { ExpressionEvaluator } from "./expressionEvaluator.mjs";
import { ScriptContext } from "./scriptContext.mjs";
import { ScriptBlock } from "./scriptBlock.mjs";
import { Instruction } from "./instruction.mjs";
import { IfInstruction } from "./ifInstruction.mjs";
import { WhileInstruction } from "./whileInstruction.mjs";
import { Function } from "./function.mjs";
import { Vector2 } from "../core/vector2.mjs";
import { Color } from "../core/color.mjs";
import { Polygon } from "../core/polygon.mjs";
import { Line } from "../core/line.mjs";
import { LineStrip, LineStripElement } from "../core/lineStrip.mjs";
import { Curve } from "../core/curve.mjs";

export class ScriptInterpreter {
    /**
     * @param {CanvasManager} manager - Canvas manager
     */
    constructor(manager) {
        this.canvasManager = manager;
        this.expressionEvaluator = new ExpressionEvaluator();
    }

    run(code) {
        this.setupEvironment();

        let rootBlock = new ScriptBlock();
        let blockStack = [rootBlock];

        code.split("\n").filter(x => x).forEach((value, index) => {
            let exp = value.trim();

            if (exp == "end") {
                blockStack.pop();
            } else if (exp.startsWith("function")) {
                let nextBlock = new ScriptBlock();
                let func = new Function(exp, nextBlock);

                this.rootContext.functions.push(func);
                blockStack.push(nextBlock);
            } else if (exp.startsWith("if")) {
                let nextBlock = new ScriptBlock();
                let instruction = new IfInstruction(exp, nextBlock);

                blockStack[blockStack.length - 1].addInstruction(instruction);
                blockStack.push(nextBlock);
            } else if (exp.startsWith("else")) {
                let nextBlock = new ScriptBlock();

                blockStack.pop();
                blockStack[blockStack.length - 1].instructions[blockStack[blockStack.length - 1].instructions.length - 1].elseBlock = nextBlock;
                blockStack.push(nextBlock);
            } else if (exp.startsWith("while")) {
                let nextBlock = new ScriptBlock();
                let instruction = new WhileInstruction(exp, nextBlock);

                blockStack[blockStack.length - 1].addInstruction(instruction);
                blockStack.push(nextBlock);
            } else if (exp.length > 0) {
                blockStack[blockStack.length - 1].addInstruction(new Instruction(exp));
            }
        });

        rootBlock.execute(this.rootContext, this.expressionEvaluator);

        this.canvasManager.layerComposer.render();
        this.canvasManager.selectedLayer = this.canvasManager.drawingLayer;
        this.canvasManager.layerPicker.translation = 0;
    }

    setupEvironment() {
        this.rootContext = new ScriptContext(null);
        this.rootContext.declareVariable("PI", Math.PI);
        this.rootContext.declareVariable("true", true);
        this.rootContext.declareVariable("false", false);

        let body = this;

        this.rootContext.functions.push(new Function("function debug(a1, a2, ...)").setCustomExecute(function (context, args, evaluator) { console.log(args.join(" ")); }));
        this.rootContext.functions.push(new Function("function init(x, y)").setCustomExecute(function (context, args, evaluator) { body.canvasManager.setup(args[0], args[1]); }));
        this.rootContext.functions.push(new Function("function nextLayer()").setCustomExecute(function (context, args, evaluator) { body.canvasManager.nextLayer; }));
        this.rootContext.functions.push(new Function("function save()").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.save(); }));
        this.rootContext.functions.push(new Function("function restore()").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.restore(); }));
        this.rootContext.functions.push(new Function("function clear()").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.clear(); }));
        this.rootContext.functions.push(new Function("function setStrokeWidth(width)").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.state.setLineWidth(args[0]); }));
        this.rootContext.functions.push(new Function("function move(length)").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.state.move(args[0]); }));
        this.rootContext.functions.push(new Function("function moveTo(point)").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.state.moveTo(args[0]); }));
        this.rootContext.functions.push(new Function("function rotate(angle)").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.state.rotate(args[0]); }));
        this.rootContext.functions.push(new Function("function setRotation(angle)").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.state.setRotation(args[0]); }));
        this.rootContext.functions.push(new Function("function line(length, brush)").setCustomExecute(function (context, args, evaluator) { body.canvasManager.currentLayer.line(args[0], args[1]); }));
        this.rootContext.functions.push(new Function("function fill(obj, brush)").setCustomExecute(function (context, args, evaluator) { DrawableCreator.create(args[0]).fill(body.canvasManager.currentLayer, args[1]); }));
        this.rootContext.functions.push(new Function("function stroke(obj, brush, thickness)").setCustomExecute(function (context, args, evaluator) { let d = DrawableCreator.create(args[0]); d.setStrokeWidth((args.length > 2) ? args[2] : body.canvasManager.currentLayer.state.lineWidth); d.stroke(body.canvasManager.currentLayer, args[1]); }));

        this.rootContext.functions.push(new Function("function Point(x, y, rX, rY)").setCustomExecute(function (context, args, evaluator) { let v = new Vector2(args[0], args[1]); if (args[2] != undefined) { if (args[3] != undefined) { v.setRange(args[2], args[3]); } else { v.setRadius(args[2]); } } return v; }));
        this.rootContext.functions.push(new Function("function Color(r, g, b, a)").setCustomExecute(function (context, args, evaluator) { return new Color(args[0], args[1], args[2], (args.length == 3) ? 1 : args[3]); }));
        this.rootContext.functions.push(new Function("function Line(start, end)").setCustomExecute(function (context, args, evaluator) { return new Line(args[0].next(), args[1].next()); }));
        this.rootContext.functions.push(new Function("function LineStrip(point, thickness, ...)").setCustomExecute(function (context, args, evaluator) { let l = new LineStrip(); for (let i = 0; i < args.length; i += 2) l.addPoint(new LineStripElement(args[i], args[i + 1])); return l; }));
        this.rootContext.functions.push(new Function("function Curve(start, end, fc, sc)").setCustomExecute(function (context, args, evaluator) { let c = new Curve(args[0].next(), args[1].next()); c.firstControl = args[2].next(); c.secondControl = args[3].next(); return c; }));
        this.rootContext.functions.push(new Function("function Polygon(v1, v2, ...)").setCustomExecute(function (context, args, evaluator) {
            let p = new Polygon();

            for (let i = 0; i < args.length; i++) {
                if (args[i] instanceof Curve) { //if argument is a curve instead of point, add curve points to polygon
                    p.allowSorting = false; //disable vertices sorting, not to break the order of curve points

                    for (let current = 0; current < 1; current += 0.05) {
                        p.addPoint(args[i].getPoint(current));
                    }

                    p.addPoint(args[i].getPoint(1));
                } else { //otherwise add the point
                    p.addPoint(args[i].next());
                }
            }

            p.sortVertices();
            return p;
        }));

        this.rootContext.functions.push(new Function("function Oval(center, minr, maxr, points, startangle, offset)").setCustomExecute(function (context, args, evaluator) { return new DrawableOval(args[0].next(), args[1], args[2], args[3], (args.length > 4) ? args[4] : 0, (args.length > 5) ? args[5] : 0); }));

        this.rootContext.functions.push(new Function("function SolidColor(color)").setCustomExecute(function (context, args, evaluator) { return new BrushSolidColor(body.canvasManager.drawingLayer.width, body.canvasManager.drawingLayer.height, args[0]); }));
        this.rootContext.functions.push(new Function("function WhiteNoise(color)").setCustomExecute(function (context, args, evaluator) { return new BrushWhiteNoise(body.canvasManager.drawingLayer.width, body.canvasManager.drawingLayer.height, args[0]); }));
        this.rootContext.functions.push(new Function("function CircularGradient(center, radius, colors...)").setCustomExecute(function (context, args, evaluator) {
            let b = new BrushCircularGradient(body.canvasManager.drawingLayer.width, body.canvasManager.drawingLayer.height, args[0].next(), args[1], args[2]);
            let lastColor = args[2];

            for (let i = 3; i < args.length; i++) {
                if (i + 1 == args.length || args[i + 1] instanceof Color) {
                    b.addStep((i - 2) / (args.length - 3), args[i]);
                    lastColor = args[i];
                } else {
                    b.addStep(args[i + 1], args[i]);
                    lastColor = args[i];
                    i++;
                }
            }

            if (b.getRemainingProgress() > 0.001)
                b.addStep(1, lastColor.copy());

            b.generate();

            return b;
        }));
        this.rootContext.functions.push(new Function("function LinearGradient(line, colors...)").setCustomExecute(function (context, args, evaluator) {
            let b = new BrushLinearGradient(body.canvasManager.drawingLayer.width, body.canvasManager.drawingLayer.height, args[0], args[1]);
            let lastColor = args[1];

            for (let i = 2; i < args.length; i++) {
                if (i + 1 == args.length || args[i + 1] instanceof Color) {
                    b.addStep((i - 1) / (args.length - 2), args[i]);
                    lastColor = args[i];
                } else {
                    b.addStep(args[i + 1], args[i]);
                    lastColor = args[i];
                    i++;
                }
            }

            if (b.getRemainingProgress() > 0.001)
                b.addStep(1, lastColor.copy());

            b.generate();

            return b;
        }));
    }
}