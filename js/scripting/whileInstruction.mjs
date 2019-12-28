import { Instruction } from "./instruction.mjs";
import { ScriptBlock } from "./scriptBlock.mjs";

export class WhileInstruction extends Instruction {
    /**
     * @param {String} exp - While instruction
     * @param {ScriptBlock} block - Block to execute while true
     */
    constructor(exp, block) {
        super(exp);

        this.block = block;
    }

    /**
     * Executes the instruction in specified context
     * @param {ScriptContext} context - Context of the instruction
     * @param {ExpressionEvaluator} evaluator - Expression evaluator
     */
    execute(context, evaluator) {
        let query = this.expression.substring(this.expression.indexOf("(") + 1, this.expression.lastIndexOf(")"));

        let satisfied = evaluator.evaluate(query, context)[0];
        
        while (satisfied != false && satisfied != undefined && satisfied != null) {
            let result = this.block.execute(context, evaluator);

            if (result[0]) {
                if (Array.isArray(result[1])) {
                    if (result[1][0] == "break")
                        return [false, null];
                    else if (result[1][0] == "continue")
                        continue;
                } else
                    return result;
            }

            satisfied = evaluator.evaluate(query, context)[0];
        }

        return [false, null];
    }
}