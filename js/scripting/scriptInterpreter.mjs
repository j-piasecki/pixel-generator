import { CanvasManager } from "../drawing/canvasManager.mjs";
import { ExpressionEvaluator } from "./expressionEvaluator.mjs";
import { ScriptContext } from "./scriptContext.mjs";
import { ScriptBlock } from "./scriptBlock.mjs";
import { Instruction } from "./instruction.mjs";
import { IfInstruction } from "./ifInstruction.mjs";
import { Function } from "./function.mjs";
import { Vector2 } from "../core/vector2.mjs";

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

                blockStack[blockStack.length -1].addInstruction(instruction);
                blockStack.push(nextBlock);
            } else if (exp.startsWith("else")) {
                let nextBlock = new ScriptBlock();

                blockStack.pop();
                blockStack[blockStack.length - 1].instructions[blockStack[blockStack.length - 1].instructions.length - 1].elseBlock = nextBlock;
                blockStack.push(nextBlock);
            } else if (exp.length > 0) {
                blockStack[blockStack.length -1].addInstruction(new Instruction(exp));
            }
        });

        rootBlock.execute(this.rootContext, this.expressionEvaluator);
    }

    setupEvironment() {
        this.rootContext = new ScriptContext(null);
        this.rootContext.declareVariable("PI", Math.PI);
        this.rootContext.declareVariable("true", true);
        this.rootContext.declareVariable("false", false);

        let body = this;

        this.rootContext.functions.push(new Function("function debug(a1, a2, ...)").setCustomExecute(function(context, args, evaluator) { console.log(args.join(" ")); }));
        this.rootContext.functions.push(new Function("function init(x, y)").setCustomExecute(function(context, args, evaluator) { body.canvasManager.init(args[0], args[1]); }));
        this.rootContext.functions.push(new Function("function V(x, y, rX, rY)").setCustomExecute(function(context, args, evaluator) { let v = new Vector2(args[0], args[1]); if (args[2] != undefined) { if (args[3] != undefined) { v.setRange(args[2], args[3]); } else { v.setRadius(args[2]); } } return v; }));
    }
}