import { Instruction } from "./instruction.mjs";

export class ScriptBlock {
    constructor() {
        this.instructions = [];
    }

    /**
     * Adds instruction to block
     * @param {Instruction} instruction - Instruction to be added
     */
    addInstruction(instruction) {
        this.instructions.push(instruction);
    }

    /**
     * Executes the block in specified context
     * @param {ScriptContext} context - Context of the instruction
     * @param {ExpressionEvaluator} evaluator - Expression evaluator
     */
    execute(context, evaluator) {
        for (let i = 0; i < this.instructions.length; i++) {
            let res = this.instructions[i].execute(context, evaluator);

            if (res[0]) {
                return res;
            }
        }

        return [false, null];
    }
}