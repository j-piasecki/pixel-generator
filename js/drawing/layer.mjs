import { Vector2 } from "../core/vector2.mjs";
import { Color } from "../core/color.mjs";

export class Layer {
    /**
     * Creates two dimensional layer of pixels with specified size
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(width, height) {
        this.setSize(width, height);

        this.savedStates = [];
        this.state = new State();
    }

    /**
     * Sets size of layer anf fills it with transparent pixels, resets saved and current states
     * @param {Number} width 
     * @param {Number} height 
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.pixels = [];
        this.clear();
    }

    /**
     * Sets every pixel to transparent, resets saved and current states
     */
    clear() {
        for (let x = 0; x < this.width; x++) {
            this.pixels[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.pixels[x][y] = new Color(0, 0, 0, 0);
            }
        }

        this.savedStates = [];
        this.state = new State();
    }

    /**
     * Adds current state to saved states stack
     */
    save() {
        this.savedStates.push(this.state.copy());
    }

    /**
     * Sets current state to the one at the top of the stack
     */
    restore() {
        this.state = this.savedStates.pop();
    }

    /**
     * @param {Number} x - First coordinate of pixel
     * @param {Number} y - Second coordinate of pixel
     * @returns {Color} - Returns color of pixel at specified position, or null if out of bonds
     */
    getPixel(x, y) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            return this.pixels[x][y];
        }

        return null;
    }

    /**
     * Sets color of pixel at specified position
     * @param {Number} x - First coordinate of pixel
     * @param {Number} y - Second coordinate of pixel
     * @param {Color} color - Color to be applied
     */
    setPixel(x, y, color) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
            this.pixels[x][y] = color;
        }
    }
}

class State {
    /**
     * Class used to store properties of a layer at a given time
     */
    constructor() {
        this.position = new Vector2(0, 0);
        this.angle = 0;
    }

    /**
     * @returns {State} - Returns copy of this state
     */
    copy() {
        let cp = new State();
        cp.position = this.position.copy();
        cp.angle = this.angle;

        return cp;
    }

    /**
     * Changes current angle by the specified value
     * @param {Number} angle - Angle in radians
     */
    rotate(angle) {
        this.angle += angle;
    }

    /**
     * Sets current angle to the specified value
     * @param {Number} angle - Angle in radians
     */
    setRotation(angle) {
        this.angle = angle;
    }

    /**
     * Moves pointer in current direction by specified margin
     * @param {Number} length - Length of shift
     */
    move(length) {
        this.position = Vector2.add(this.position, new Vector2(0, length).rotate(this.angle));
    }

    /**
     * Sets pointer to the specified point
     * @param {Vector2} point - New pointer
     */
    moveTo(point) {
        this.position.x = point.x;
        this.position.y = point.y;
    }
}