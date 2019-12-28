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
        } else if (this.expression.startsWith("break")) {
            return [true, ["break"]];
        }  else if (this.expression.startsWith("continue")) {
            return [true, ["continue"]];
        } else if (this.expression.startsWith("let ")) {
            let name = this.expression.substring(4, this.expression.indexOf("=")).trim();
            let value = this.expression.substring(this.expression.indexOf("=") + 1).trim();

            context.declareVariable(name, evaluator.evaluate(value, context)[0]);
        } else if (this.expression.indexOf("=") != -1) {
            let index = this.expression.indexOf("=") - 1;
            let name = this.expression.substring(0, (this.expression.charAt(index) == "*" || this.expression.charAt(index) == "/" || this.expression.charAt(index) == "%" || this.expression.charAt(index) == "+" || this.expression.charAt(index) == "-") ? index : index + 1).trim();
            let value = this.expression.substring(this.expression.indexOf("=") + 1).trim();

            switch (this.expression.charAt(index)) {
                case "*": context.setVariable(name, context.getVariable(name) * evaluator.evaluate(value, context)[0]); break;
                case "/": context.setVariable(name, context.getVariable(name) / evaluator.evaluate(value, context)[0]); break;
                case "%": context.setVariable(name, context.getVariable(name) % evaluator.evaluate(value, context)[0]); break;
                case "+": context.setVariable(name, context.getVariable(name) + evaluator.evaluate(value, context)[0]); break;
                case "-": context.setVariable(name, context.getVariable(name) - evaluator.evaluate(value, context)[0]); break;
                default: context.setVariable(name, evaluator.evaluate(value, context)[0]); break;
            }
        } else {
            evaluator.evaluate(this.expression, context);
        }

        return [false, null];
    }
}