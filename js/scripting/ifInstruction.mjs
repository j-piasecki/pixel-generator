import { Instruction } from "./instruction.mjs";
import { ScriptBlock } from "./scriptBlock.mjs";

export class IfInstruction extends Instruction {
    /**
     * @param {String} exp - If instruction
     * @param {ScriptBlock} ifBlock - Block to execute if true
     * @param {?ScriptBlock} elseBlock - Block to execute if false
     */
    constructor(exp, ifBlock, elseBlock) {
        super(exp);

        this.ifBlock = ifBlock;
        this.elseBlock = elseBlock;
    }

    /**
     * Executes the instruction in specified context
     * @param {ScriptContext} context - Context of the instruction
     * @param {ExpressionEvaluator} evaluator - Expression evaluator
     */
    execute(context, evaluator) {
        let query = this.expression.substring(this.expression.indexOf("(") + 1, this.expression.lastIndexOf(")"));

        let satisfied = evaluator.evaluate(query, context)[0];
        
        if (satisfied != false && satisfied != undefined && satisfied != null) {
            return this.ifBlock.execute(context, evaluator);
        } else if (this.elseBlock != undefined && this.elseBlock != null) {
            return this.elseBlock.execute(context, evaluator);
        }

        return [false, null];
    }
}