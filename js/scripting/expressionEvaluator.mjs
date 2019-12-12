import { ScriptContext } from "./scriptContext.mjs";

const Operator = {
    ADD: "+",
    SUBTRACT: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    POWER: "^",
    OPEN_PARENTHESIS: "(",
    CLOSE_PARENTHESIS: ")",
    QUOTE: "\""
}

export class ExpressionEvaluator {
    constructor() {
        
    }

    /**
     * Creates stack based on query and evaluates it
     * @param {String} query - Query to be evaluated
     * @param {ScriptContext} context - Context of the expression
     */
    evaluate(query, context) {
        let index = 0;
        let stack = [];

        while (index >= 0 && index < query.length) {
            let opIndex = this.findNextOperator(stack, query, index);
            if (opIndex == -1) break;
            if (opIndex == undefined) {
                stack.push(query.substring(index, opIndex).trim());
                break;
            }

            if (index != opIndex) {
                if (this.insideQuote(stack)) {
                    stack.push(query.substring(index, opIndex));
                } else {
                    let operand = query.substring(index, opIndex).trim();
                    if (operand.length > 0)
                        stack.push(operand);
                }

                stack.push(query.charAt(opIndex));
            } else {
                stack.push(query.charAt(opIndex));
            }

            index = opIndex + 1;
        }

        return this.evaluateStack(stack, context);
    }

    /**
     * Splits compount expression into simpler ones and evaluates them
     * @param {Array} stack - Stack to be evaluated
     * @param {ScriptContext} context - Context of the expression
     */
    evaluateStack(stack, context) {
        let start = stack.indexOf(Operator.OPEN_PARENTHESIS);

        while (start != -1) {
            let index = start + 1;
            let nesting = 1;

            while (nesting > 0) {
                let nextOpen = stack.indexOf(Operator.OPEN_PARENTHESIS, index);
                let nextClose = stack.indexOf(Operator.CLOSE_PARENTHESIS, index);

                if (nextOpen < nextClose && nextOpen != -1) {
                    nesting++;
                    index = nextOpen + 1;
                } else if ((nextClose < nextOpen || nextOpen == -1) && nextClose != -1) {
                    nesting--;
                    index = nextClose + 1;
                }

                if (nesting != 0 && nextOpen == -1 && nextClose == -1) {
                    console.log("Missing parenthesis");
                    return;
                }
            }
            
            if (start > 0 && stack[start - 1] != Operator.ADD && stack[start - 1] != Operator.SUBTRACT && stack[start - 1] != Operator.MULTIPLY && stack[start - 1] != Operator.DIVIDE) {
                stack.splice(start - 1, index - start + 1, this.evaluateFunction(stack[start - 1], stack.slice(start + 1, index - 1), new ScriptContext(context)));
                start = stack.indexOf(Operator.OPEN_PARENTHESIS);
            } else {
                stack.splice(start, index - start, ...this.evaluateStack(stack.slice(start + 1, index - 1), context));
                start = stack.indexOf(Operator.OPEN_PARENTHESIS);
            }
        }

        if (start == -1) {
            while (stack.indexOf(Operator.CLOSE_PARENTHESIS) != -1)
                stack.splice(stack.indexOf(Operator.CLOSE_PARENTHESIS), 1);

            return this.evaluateExpression(stack, context);
        }
    }

    /**
     * Evaluates simple expressions
     * @param {Array} stack - Stack to be evaluated
     * @param {ScriptContext} context - Context of the expression
     */
    evaluateExpression(stack, context) {
        if (stack.length == 1) {
            let result = this.getValue(stack, 0, context);

            if (Array.isArray(result)) {
                return ["\"", result[0], "\""];
            } else {
                return [result];
            }
        }

        let index = stack.indexOf(Operator.POWER);

        while (index != -1) {
            stack.splice(index - 1, 3, Math.pow(this.getValue(stack, index - 1, context), this.getValue(stack, index + 1, context)));
            index = stack.indexOf(Operator.MULTIPLY);
        }

        index = stack.indexOf(Operator.MULTIPLY);

        while (index != -1) {
            stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) * this.getValue(stack, index + 1, context));
            index = stack.indexOf(Operator.MULTIPLY);
        }

        index = stack.indexOf(Operator.DIVIDE);

        while (index != -1) {
            stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) / this.getValue(stack, index + 1, context));
            index = stack.indexOf(Operator.DIVIDE);
        }

        index = stack.indexOf(Operator.ADD);

        while (index != -1) {
            let arg1 = this.getValue(stack, index - 1, context), arg2 = this.getValue(stack, index + 1, context);
            let result, start, end;
            
            if (Array.isArray(arg1) && Array.isArray(arg2)) {
                result = ["\"", arg1[0] + arg2[0], "\""];
                start = arg1[1];
                end = arg2[1];
            } else if (Array.isArray(arg1) && !Array.isArray(arg2)) {
                result = ["\"", arg1[0] + arg2, "\""];
                start = arg1[1];
                end = index + 1;
            } else if (!Array.isArray(arg1) && Array.isArray(arg2)) {
                result = ["\"", arg1 + arg2[0], "\""];
                start = index - 1;
                end = arg2[1];
            } else if (!Array.isArray(arg1) && !Array.isArray(arg2)) {
                result = [arg1 + arg2];
                start = index - 1;
                end = index + 1;
            }

            stack.splice(start, end - start + 1, ...result);
            index = stack.indexOf(Operator.ADD);
        }

        index = stack.indexOf(Operator.SUBTRACT);

        while (index != -1) {
            stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) - this.getValue(stack, index + 1, context));
            index = stack.indexOf(Operator.SUBTRACT);
        }

        return stack;
    }

    /**
     * Evaluates function
     * @param {String} name - Name of the function
     * @param {String} args - Arguments of the function
     * @param {ScriptContext} context - Context of the function
     */
    evaluateFunction(name, args, context) {
        console.log("evaluate: " + name + "(" + args + ")");

        return 0;
    }

    /**
     * Calculates value of single item
     * @param {Array} stack - Currently evaluated stack
     * @param {Number} index - Index of the item
     * @param {ScriptContext} context - Context of the expression
     */
    getValue(stack, index, context) {
        if (stack[index] == Operator.QUOTE) {
            if (stack[index + 1] == Operator.ADD || stack[index + 1] == Operator.SUBTRACT || stack[index + 1] == Operator.MULTIPLY || stack[index + 1] == Operator.DIVIDE) {
                return [stack[index - 1], index - 2];
            } else {
                return [stack[index + 1], index + 2];
            }
        } else if (!Number.isNaN(parseFloat(stack[index]))) {
            return Number(stack[index]);
        } else {
            let value = stack[index];

            if (!Number.isNaN(parseFloat(value))) {
                return Number(value);
            } else {
                let variable = context.getVariable(value);

                if (typeof(variable) == "string" || variable instanceof String) {
                    return [variable, index];
                }

                return variable;
            }
        }
    }

    /**
     * Finds index of next operator
     * @param {Array} stack - Current evaluation stack
     * @param {String} query - Query being evaluated
     * @param {Number} index - Start index
     */
    findNextOperator(stack, query, index) {
        if (stack.length > 0 && stack[stack.length - 1] == Operator.QUOTE) {
            if (this.insideQuote(stack)) {
                do {
                    index = query.indexOf("\"", index + 1);
                } while (index != -1 && query.charAt[index - 1] == "\\");

                return index;
            }
        }

        return [query.indexOf(Operator.ADD, index), query.indexOf(Operator.SUBTRACT, index), query.indexOf(Operator.MULTIPLY, index), query.indexOf(Operator.DIVIDE, index), query.indexOf(Operator.OPEN_PARENTHESIS, index), query.indexOf(Operator.CLOSE_PARENTHESIS, index), query.indexOf(Operator.QUOTE, index), query.indexOf(Operator.POWER, index)].filter(x => { return x != -1 }).sort((a, b) => { return a - b; })[0];
    }

    /**
     * Checks if pointer is inside quote
     * @param {Array} stack - Current evaluation stack
     * @returns {Boolean}
     */
    insideQuote(stack) {
        let inside = false;

        for (let i = 0; i < stack.length; i++) {
            if (stack[i] == Operator.QUOTE) inside = !inside;
        }

        return inside;
    }
}