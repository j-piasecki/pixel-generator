import { Layer } from "../layer.mjs";

export class Brush {
    /**
     * Brush base class
     * @param {Number} width - Width of generated layer
     * @param {Number} height - Height of generated layer
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.layer = new Layer(width, height);
    }
}