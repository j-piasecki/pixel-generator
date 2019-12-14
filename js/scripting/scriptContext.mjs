export class ScriptContext {
    /**
     * @param {?ScriptContext} parent - Parent context
     */
    constructor(parent) {
        this.parent = parent;
        this.findRoot();

        this.variables = {};
        this.functions = [];

        this.logErrorInfo = true;
    }

    /**
     * @param {String} name - Name of the variable
     * @returns {Object} - Returns value of the specified variable
     */
    getVariable(name) {
        if (this.variables[name] != undefined)
            return this.variables[name];
        
        if (this.parent != null)
            return this.parent.getVariable(name);
        else if (this.logErrorInfo)
            console.log("Usage of undeclared variable: " + name);
    }

    /**
     * Sets variable to specified value in lowest context it is declared
     * @param {String} name - Name of the variable
     * @param {Object} value - New value of the variable
     */
    setVariable(name, value) {
        if (this.variables[name])
            this.variables[name] = value;
        else if (this.parent != null)
            this.parent.setVariable(name, value);
        else if (this.logErrorInfo)
            console.log("Usage of undeclared variable: " + name);
    }

    /**
     * Sets variable to specified value in this context
     * @param {String} name - Name of the variable
     * @param {Object} value - New value of the variable
     */
    declareVariable(name, value) {
        this.variables[name] = value;
    }

    /**
     * Calls function with specified name and passes the arguments
     * @param {String} name - Name of the function
     * @param {Array} args - Array of arguments
     * @param {ExpressionEvaluator} evaluator - Expression evaluator
     */
    callFunction(name, args, evaluator) {
        for (let i = 0; i < this.functions.length; i++) {
            if (this.functions[i].name == name) {
                return this.functions[i].execute(this.root, args, evaluator);
            }
        }

        if (this.parent != null)
            return this.parent.callFunction(name, args, evaluator);
        else if (this.logErrorInfo)
            console.log("Usage of undeclared function: " + name);
    }

    /**
     * Finds the root context
     */
    findRoot() {
        this.root = this.parent;

        let previous = null;

        while (this.root != null) {
            previous = this.root;

            this.root = this.root.parent;
        }

        this.root = previous;

        if (this.root == null) this.root = this;
    }
}