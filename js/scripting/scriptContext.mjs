export class ScriptContext {
    /**
     * @param {?ScriptContext} parent - Parent context
     */
    constructor(parent) {
        this.parent = parent;
        this.findRoot();

        this.variables = {};
    }

    /**
     * @param {String} name - Name of the variable
     * @returns {Object} - Returns value of the specified variable
     */
    getVariable(name) {
        if (this.variables[name])
            return this.variables[name];
        
        if (this.parent != null)
            return this.parent.getVariable(name);
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
    }
}