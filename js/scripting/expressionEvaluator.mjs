import { ScriptContext } from "./scriptContext.mjs";

const Operator = {
    ADD: "+",
    SUBTRACT: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    POWER: "^",
    OPEN_PARENTHESIS: "(",
    CLOSE_PARENTHESIS: ")",
    OPEN_BRACKET: "[",
    CLOSE_BRACKET: "]",
    COLON: ":",
    QUOTE: "\"",

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
            let nextOp = this.findNextOperator(stack, query, index);
            let opIndex = (nextOp == undefined) ? -1 : nextOp[0];

            if (nextOp == undefined) {
                stack.push(query.substring(index).trim());
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

                stack.push(nextOp[1]);
            } else {
                stack.push(nextOp[1]);
            }

            index = opIndex + nextOp[1].length;
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
            
            if (start > 0 && !this.isOperator(stack[start - 1])) {
                let end = start + 1;
                nesting = 1;

                while (nesting > 0) {
                    if (stack[end] == Operator.OPEN_PARENTHESIS) nesting++;
                    if (stack[end] == Operator.CLOSE_PARENTHESIS) nesting--;

                    end++;
                }
                
                stack.splice(start - 1, end, this.evaluateFunction(stack[start - 1], stack.slice(start + 1, end - 1), context));
                
                start = stack.indexOf(Operator.OPEN_PARENTHESIS);
            } else {
                stack.splice(start, index - start, ...this.evaluateStack(stack.slice(start + 1, index - 1), context));
                start = stack.indexOf(Operator.OPEN_PARENTHESIS);
            }
        }

        while (stack.indexOf(Operator.CLOSE_PARENTHESIS) != -1)
            stack.splice(stack.indexOf(Operator.CLOSE_PARENTHESIS), 1);

        return this.evaluateExpression(stack, context);
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

        //Handle unary minus operator
        for (let i = 0; i < stack.length; i++) {
            if (stack[i] == Operator.SUBTRACT && (i == 0 || this.isOperator(stack[i - 1]))) {
                stack.splice(i, 2, -this.getValue(stack, i + 1, context));
                i--;
            }
        }

        //Handle unary negation operator
        for (let i = 0; i < stack.length; i++) {
            if (stack[i] == Operator.NEGATION && (i == 0 || this.isOperator(stack[i - 1]))) {
                let val = this.getValue(stack, i + 1, context);
                stack.splice(i, 2, (val == false || val == undefined || val == null));
                i--;
            }
        }

        //Handle random numbers
        let index = stack.indexOf(Operator.OPEN_BRACKET);
        
        while (index != -1) {
            let close = stack.indexOf(Operator.CLOSE_BRACKET, index);
            let colon = stack.indexOf(Operator.COLON, index) + 1;
            let nextColon = stack.indexOf(Operator.COLON, colon);
            let n1 = this.evaluateStack(stack.slice(index + 1, colon - 1), context)[0], n2 = this.evaluateStack(stack.slice(colon, close), context)[0];
            let value = 0;

            if (nextColon == -1) {
                if (Number.isInteger(n1) && Number.isInteger(n2))
                    value = Math.round(n1 + (n2 - n1) * Math.random());
                else
                    value = n1 + (n2 - n1) * Math.random();
            } else {
                n2 = this.evaluateStack(stack.slice(colon, nextColon), context)[0]

                if (stack[nextColon + 1] == "d")
                    value = n1 + (n2 - n1) * Math.random();
                else if (stack[nextColon + 1] == "i")
                    value = Math.round(n1 + (n2 - n1) * Math.random());
            }

            stack.splice(index, close - index + 1, value);
            index = stack.indexOf(Operator.OPEN_BRACKET);
        }

        //Handle power operator
        index = stack.indexOf(Operator.POWER);

        while (index != -1) {
            stack.splice(index - 1, 3, Math.pow(this.getValue(stack, index - 1, context), this.getValue(stack, index + 1, context)));
            index = stack.indexOf(Operator.MULTIPLY);
        }

        //Handle multiply operator
        index = stack.indexOf(Operator.MULTIPLY);

        while (index != -1) {
            stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) * this.getValue(stack, index + 1, context));
            index = stack.indexOf(Operator.MULTIPLY);
        }

        //Handle divide operator
        index = stack.indexOf(Operator.DIVIDE);

        while (index != -1) {
            stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) / this.getValue(stack, index + 1, context));
            index = stack.indexOf(Operator.DIVIDE);
        }

        //handle add operator
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

        //Handle subtract operator
        index = stack.indexOf(Operator.SUBTRACT);

        while (index != -1) {
            stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) - this.getValue(stack, index + 1, context));
            index = stack.indexOf(Operator.SUBTRACT);
        }

        return this.evaluateLogic(stack, context);
    }

    /**
     * Evaluates logical expressions
     * @param {Array} stack - Stack to be evaluated
     * @param {ScriptContext} context - Context of the expression
     */
    evaluateLogic(stack, context) {
        //Check whether there are logical connectives in stack, if not then handle logical operations, else handle connectives
        if (stack.indexOf(Operator.AND) == -1 && stack.indexOf(Operator.OR) == -1) {
            //Handle equal operation
            let index = stack.indexOf(Operator.EQUAL);

            while (index != -1) {
                stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) == this.getValue(stack, index + 1, context));
                index = stack.indexOf(Operator.EQUAL);
            }

            //Handle not equal operation
            index = stack.indexOf(Operator.NOT_EQUAL);

            while (index != -1) {
                stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) != this.getValue(stack, index + 1, context));
                index = stack.indexOf(Operator.NOT_EQUAL);
            }

            //Handle greater or equal operation
            index = stack.indexOf(Operator.GREATER_OR_EQUAL);

            while (index != -1) {
                stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) >= this.getValue(stack, index + 1, context));
                index = stack.indexOf(Operator.GREATER_OR_EQUAL);
            }

            //Handle lesser or equal operation
            index = stack.indexOf(Operator.LESSER_OR_EQUAL);

            while (index != -1) {
                stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) <= this.getValue(stack, index + 1, context));
                index = stack.indexOf(Operator.LESSER_OR_EQUAL);
            }
            
            //Handle greater operation
            index = stack.indexOf(Operator.GREATER);

            while (index != -1) {
                stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) > this.getValue(stack, index + 1, context));
                index = stack.indexOf(Operator.GREATER);
            }

            //Handle lesser operation
            index = stack.indexOf(Operator.LESSER);

            while (index != -1) {
                stack.splice(index - 1, 3, this.getValue(stack, index - 1, context) < this.getValue(stack, index + 1, context));
                index = stack.indexOf(Operator.LESSER);
            }
        } else {
            let index = 0;
            for (let i = 0; i < stack.length; i++) {
                //Handle or connective
                if (stack[i] == Operator.OR) {
                    let value = this.evaluateExpression(stack.slice(0, i), context)[0];

                    //If any of the expressions is true return true, else replace them with false and continue evaluation
                    if (value != false && value != undefined && value != null) { return [true]; }
                    else {
                        let nextOr = stack.indexOf(Operator.OR, i + 1), nextAnd = stack.indexOf(Operator.AND, i + 1), next = 0;
                        if (nextOr == -1 && nextAnd == -1) next = stack.length;
                        else if (nextOr == -1) next = nextAnd;
                        else if (nextAnd == -1) next = nextOr;
                        else next = (nextOr < nextAnd) ? nextOr : nextAnd;

                        value = this.evaluateExpression(stack.slice(i + 1, next), context)[0];
                        
                        if (value != false && value != undefined && value != null) { return [true]; }
                        else {
                            stack.splice(0, next, false);
                            i = 0;
                        }
                    }
                } 
                //Handle and connective
                else if (stack[i] == Operator.AND) {
                    let value = this.evaluateExpression(stack.slice(0, i), context)[0];

                    //If any of the expressions is false return false, else replace them with true and continue evaluation
                    if (value == false || value == undefined || value == null) { return [false]; }
                    else {
                        let nextOr = stack.indexOf(Operator.OR, i + 1), nextAnd = stack.indexOf(Operator.AND, i + 1), next = 0;
                        if (nextOr == -1 && nextAnd == -1) next = stack.length;
                        else if (nextOr == -1) next = nextAnd;
                        else if (nextAnd == -1) next = nextOr;
                        else next = (nextOr < nextAnd) ? nextOr : nextAnd;

                        value = this.evaluateExpression(stack.slice(i + 1, next), context)[0];
                        
                        if (value == false || value == undefined || value == null) { return [false]; }
                        else {
                            stack.splice(0, next, true);
                            i = 0;
                        }
                    }
                }
            }
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
        if (args.length > 1) {
            let start = 0, nesting = 0;
            let newArgs = [];
            
            for (let i = 0; i < args.length; i++) {
                if (args[i] == Operator.OPEN_PARENTHESIS) nesting++;
                if (args[i] == Operator.CLOSE_PARENTHESIS) nesting--;

                if (nesting == 0 && args[i].indexOf(",") != -1) {
                    let split = args[i].split(","), toAdd = [];

                    for (let j = 0; j < split.length; j++) {
                        toAdd.push(split[j].trim());
                        if (j != split.length - 1) toAdd.push("|");
                    }
                    
                    args.splice(i, 1, ...toAdd);
                    i += 2;
                }
            }
            args = args.filter(x => x);

            for (let i = 0; i < args.length; i++) {
                if (args[i] == "|" || i == args.length - 1) {
                    newArgs.push(this.evaluate(args.slice(start, i + (i == args.length - 1 ? 1 : 0)).join(""), context)[0]);

                    start = i + 1;
                }
            }

            args = newArgs;
        } else if (args.length == 1) {
            args = args[0].split(",");

            for (let i = 0; i < args.length; i++) {
                args[i] = this.evaluate(args[i], context)[0];
            }
        }

        return context.callFunction(name, args, this);
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
            if (typeof(value) == "object" || value == undefined) return value;

            let variable = context.getVariable(value);

            if (typeof(variable) == "string" || variable instanceof String) {
                return [variable, index];
            }

            return variable;
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

                return [index, Operator.QUOTE];
            }
        }

        let indexes = [];
        let keys = Object.keys(Operator);

        for (let i = 0; i < keys.length; i++) {
            indexes.push([query.indexOf(Operator[keys[i]], index), Operator[keys[i]]]);
        }

        return indexes.filter(x => { return x[0] != -1 }).sort((a, b) => { if (a[0] == b[0]) return b[1].length - a[1].length; else return a[0] - b[0]; })[0];
    }

    /**
     * Checks if provided expression is an opertator
     * @param {String} exp - Expression
     */
    isOperator(exp) {
        let keys = Object.keys(Operator);

        for (let i = 0; i < keys.length; i++) {
            if (Operator[keys[i]] == exp) return true;
        }

        return false;
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