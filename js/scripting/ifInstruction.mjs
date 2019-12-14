import { Instruction } from "./instruction.mjs";
import { ScriptBlock } from "./scriptBlock.mjs";

const LogicOperator = {
    OR: "||",
    AND: "&&",
    EQUAL: "==",
    NOT_EQUAL: "!=",
    GREATER: ">",
    GREATER_OR_EQUAL: ">=",
    LESSER: "<",
    LESSER_OR_EQUAL: "<=",
    NEGATION: "!"
}

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
        //TODO: make something useful, probably integrating logic into expressionEvaluator is not a bad idea
        let query = this.expression.substring(this.expression.indexOf("(") + 1, this.expression.lastIndexOf(")"));

        let ops = Object.keys(LogicOperator);
        for (let i = 0; i < ops.length; i++) {
            if (query.indexOf(LogicOperator[ops[i]]) != -1) {
                let split = query.split(LogicOperator[ops[i]]);
                split[0] = evaluator.evaluate(split[0], context)[0];
                split[1] = evaluator.evaluate(split[1], context)[0];

                let satisfied = false;

                switch (LogicOperator[ops[i]]) {
                    case LogicOperator.EQUAL:
                        if (split[0] == split[1]) satisfied = true;
                    break;

                    case LogicOperator.NOT_EQUAL:
                        if (split[0] != split[1]) satisfied = true;
                    break;

                    case LogicOperator.GREATER:
                        if (split[0] > split[1]) satisfied = true;
                    break;

                    case LogicOperator.GREATER_OR_EQUAL:
                        if (split[0] >= split[1]) satisfied = true;
                    break;

                    case LogicOperator.LESSER:
                        if (split[0] < split[1]) satisfied = true;
                    break;

                    case LogicOperator.LESSER_OR_EQUAL:
                        if (split[0] <= split[1]) satisfied = true;
                    break;
                }

                if (satisfied) {
                    return this.ifBlock.execute(context, evaluator);
                } else if (this.elseBlock != undefined && this.elseBlock != null) {
                    return this.elseBlock.execute(context, evaluator);
                }
            }
        }

        return [false, null];
    }
}