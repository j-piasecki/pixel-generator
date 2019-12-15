import { ExpressionEvaluator } from "./expressionEvaluator.mjs";
import { ScriptContext } from "./scriptContext.mjs";

export class Instruction {
    /**
     * @param {String} exp - Instruction
     */
    constructor(exp) {
        this.expression = exp;
    }

    /**
     * Executes the instruction in specified context
     * @param {ScriptContext} context - Context of the instruction
     * @param {ExpressionEvaluator} evaluator - Expression evaluator
     */
    execute(context, evaluator) {
        if (this.expression.startsWith("return")) {
            return [true, evaluator.evaluate(this.expression.substring(6), context)[0]];
        } else if (this.expression.startsWith("let ")) {
            let name = this.expression.substring(4, this.expression.indexOf("=")).trim();
            let value = this.expression.substring(this.expression.indexOf("=") + 1).trim();

            context.declareVariable(name, evaluator.evaluate(value, context)[0]);
        } else if (this.expression.indexOf("=") != -1) {
            let name = this.expression.substring(0, this.expression.indexOf("=")).trim();
            let value = this.expression.substring(this.expression.indexOf("=") + 1).trim();

            context.setVariable(name, evaluator.evaluate(value, context)[0]);
        } else {
            evaluator.evaluate(this.expression, context);
        }

        return [false, null];
    }
}