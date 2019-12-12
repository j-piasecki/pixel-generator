import { ExpressionEvaluator } from "./expressionEvaluator.mjs";

export class ScriptInterpreter {
    constructor() {
        this.expressionEvaluator = new ExpressionEvaluator();
    }

    run(code) {
        let lines = code.split("\n").filter(x => x);

        lines.forEach((value, index) => {
            lines[index] = value.trim();
            console.log(this.expressionEvaluator.evaluate(lines[index]));
        })
    }
}