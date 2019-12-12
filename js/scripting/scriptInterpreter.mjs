import { ExpressionEvaluator } from "./expressionEvaluator.mjs";
import { ScriptContext } from "./scriptContext.mjs";

export class ScriptInterpreter {
    constructor() {
        this.expressionEvaluator = new ExpressionEvaluator();

        this.rootContext = new ScriptContext(null);
        this.rootContext.declareVariable("PI", Math.PI);
    }

    run(code) {
        let lines = code.split("\n").filter(x => x);

        lines.forEach((value, index) => {
            lines[index] = value.trim();
            console.log(this.expressionEvaluator.evaluate(lines[index], this.rootContext));
        })
    }
}