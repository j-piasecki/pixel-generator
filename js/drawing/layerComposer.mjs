import { Vector2 } from "../core/vector2.mjs";
import { Color } from "../core/color.mjs";
import { Layer } from "./layer.mjs";

export class LayerComposer {
    /**
     * Layer manager used to compse all layers into drawing buffer
     * @param {Layer} target - Layer on which the composed image will be drawn
     */
    constructor(target) {
        this.target = target;

        this.layers = [];
    }

    /**
     * @returns {Layer} - Returns new layer and puts it on top of the drawing stack
     */
    nextLayer() {
        let layer = new Layer(this.target.width, this.target.height);

        this.layers.push(layer);

        return layer;
    }

    /**
     * Create image and draw it onto target layer
     */
    render() {
        this.target.clear();

        for (let x = 0; x < this.target.width; x++) {
            for (let y = 0; y < this.target.height; y++) {
                for (let i = 0; i < this.layers.length; i++) {
                    this.target.pixels[x][y] = Color.blend(this.target.pixels[x][y], this.layers[i].pixels[x][y]);
                }
            }
        }

        for (let i = 0; i < this.layers.length; i++) {
            this.target.wireframes = this.target.wireframes.concat(this.layers[i].wireframes);
        }
    }

    /**
     * Remove all layers
     */
    clear() {
        this.layers = [];
    }
}