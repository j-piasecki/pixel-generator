import { ScriptContext } from "./scriptContext.mjs";
import { ScriptBlock } from "./scriptBlock.mjs";

export class Function {
    /**
     * @param {String} exp - Definition of the function
     * @param {ScriptBlock} block - Body of the function
     */
    constructor(exp, block) {
        this.expression = exp;
        this.block = block;

        this.name = exp.substring(exp.indexOf(" "), exp.indexOf("(")).trim();
        this.arguments = exp.substring(exp.indexOf("(") + 1, exp.indexOf(")")).replace(" ", "").split(",");
    }
    
    /**
     * Executes the function in specified context, passing the arguments
     * @param {ScriptContext} context - Context of the instruction
     * @param {Array} args - Array of arguments
     * @param {ExpressionEvaluator} evaluator - Expression evaluator
     */
    execute(context, args, evaluator) {
        let innerContext = new ScriptContext(context);
        for (let i = 0; i < this.arguments.length; i++) {
            innerContext.declareVariable(this.arguments[i], args[i]);
        }

        let res = this.block.execute(innerContext, evaluator);

        if (res[0]) {
            return res[1];
        }
    }

    /**
     * Sets custom execute function
     * @param {function(context, args, evaluator)} replacement - New function to be used
     * @returns {Function} - Returns this function
     */
    setCustomExecute(replacement) {
        this.execute = replacement;

        return this;
    }
}