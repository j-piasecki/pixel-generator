export class ScriptInterpreter {
    constructor() {

    }

    run(code) {
        let lines = code.split("\n").filter(x => x);

        lines.forEach((value, index) => {
            lines[index] = value.trim();
            console.log(lines[index]);
        })
    }
}